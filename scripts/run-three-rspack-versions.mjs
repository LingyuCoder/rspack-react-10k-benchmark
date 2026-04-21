import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  VERSION_MATRIX,
  getSelectedScenarios,
  getVersionsForScenario,
} from './version-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CASE_DIR = path.join(ROOT, 'cases/react-10k');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');
const RUN_META_JSON = path.join(ARTIFACTS_DIR, 'run-meta.json');
const SHELL = process.env.SHELL || '/bin/bash';
export const DEFAULT_SAMPLES_PER_VERSION = 1;
export const DEFAULT_BENCHMARK_RUN_TIMES = 10;
export const DEFAULT_BENCHMARK_WARMUP_TIMES = 2;

function runShell(command, cwd = ROOT) {
  return execFileSync(SHELL, ['-lc', command], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function extractTable(text, marker) {
  const section = text.slice(text.indexOf(marker));
  const lines = section
    .split('\n')
    .filter((item) => item.startsWith('|'));
  if (lines.length < 3) {
    throw new Error(`Unable to find markdown table in ${marker}`);
  }
  const header = lines[0]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  return { header, lines };
}

function extractRow(text, toolName, marker) {
  const { header, lines } = extractTable(text, marker);
  const matchedLine = lines
    .slice(2)
    .find((item) => item.startsWith('|') && item.includes(toolName));
  if (!matchedLine) {
    throw new Error(`Unable to find ${toolName} row in ${marker}`);
  }
  const row = matchedLine
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  return { header, row };
}

export function parseRunMetrics(stdout, toolName) {
  const { header: devHeader, row: devRow } = extractRow(
    stdout,
    toolName,
    'Development metrics:',
  );
  const { header: buildHeader, row: buildRow } = extractRow(
    stdout,
    toolName,
    'Build metrics:',
  );
  const dev = Object.fromEntries(devHeader.map((title, index) => [title, devRow[index]]));
  const build = Object.fromEntries(
    buildHeader.map((title, index) => [title, buildRow[index]]),
  );
  return {
    build_ms: Number.parseInt(build['Build (no cache)'], 10),
    startup_with_cache_ms: Number.parseInt(dev['Startup (with cache)'], 10),
    hmr_ms: dev.HMR ? Number.parseInt(dev.HMR, 10) : undefined,
    output_size_kb: Number.parseFloat(build['Output size']),
  };
}

function setVersion(version) {
  if (version.webpackDevServerOverride) {
    runShell(
      `npx -y -p node@24.14.1 -c 'corepack pnpm pkg set "pnpm.overrides.webpack-dev-server=${version.webpackDevServerOverride}"'`,
    );
  } else {
    runShell(
      `npx -y -p node@24.14.1 -c 'corepack pnpm pkg delete "pnpm.overrides.webpack-dev-server" || true'`,
    );
  }

  const rootDeps = Object.entries(version.root)
    .map(([name, depVersion]) => `${name}@${depVersion}`)
    .join(' ');
  const caseDeps = Object.entries(version.case)
    .map(([name, depVersion]) => `${name}@${depVersion}`)
    .join(' ');

  runShell(
    `npx -y -p node@24.14.1 -c 'corepack pnpm add -Dw ${rootDeps} && corepack pnpm install'`,
  );
  runShell(
    `npx -y -p node@24.14.1 -c 'corepack pnpm add -D ${caseDeps} && corepack pnpm install'`,
    CASE_DIR,
  );
}

function main() {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
  const sampleCount = Number.parseInt(
    process.env.RUNS ?? String(DEFAULT_SAMPLES_PER_VERSION),
    10,
  );
  const benchmarkRunTimes = Number.parseInt(
    process.env.RUN_TIMES ?? String(DEFAULT_BENCHMARK_RUN_TIMES),
    10,
  );
  const benchmarkWarmupTimes = Number.parseInt(
    process.env.WARMUP_TIMES ?? String(DEFAULT_BENCHMARK_WARMUP_TIMES),
    10,
  );
  const results = [];
  const scenarios = getSelectedScenarios();

  writeFileSync(
    RUN_META_JSON,
    JSON.stringify(
      {
        samples_per_version: sampleCount,
        benchmark_run_times: benchmarkRunTimes,
        benchmark_warmup_times: benchmarkWarmupTimes,
        versions: VERSION_MATRIX.map((version) => version.label),
        scenarios: scenarios.map((scenario) => ({
          key: scenario.key,
          label: scenario.label,
          cache_mode: scenario.cacheMode,
          measure_hmr: scenario.measureHmr,
          versions: getVersionsForScenario(scenario).map((version) => version.label),
        })),
      },
      null,
      2,
    ) + '\n',
  );

  for (const scenario of scenarios) {
    console.log(`\n=== ${scenario.label} ===`);

    for (const version of getVersionsForScenario(scenario)) {
      console.log(`\n=== ${scenario.label} / ${version.label} ===`);
      setVersion(version);

      for (let run = 1; run <= sampleCount; run += 1) {
        console.log(`Running ${version.label} sample ${run}/${sampleCount}`);
        const stdout = runShell(
          `npx -y -p node@24.14.1 -c 'CASE=react-10k TOOLS=rspack RSPACK_CACHE_MODE=${scenario.cacheMode} BENCHMARK_HMR=${scenario.measureHmr ? '1' : '0'} RUN_TIMES=${benchmarkRunTimes} WARMUP_TIMES=${benchmarkWarmupTimes} corepack pnpm benchmark'`,
        );
        writeFileSync(
          path.join(ARTIFACTS_DIR, `${scenario.key}-${version.key}-run-${run}.txt`),
          stdout,
        );
        results.push({
          scenario_key: scenario.key,
          scenario_label: scenario.label,
          version: version.label,
          run,
          ...parseRunMetrics(stdout, version.toolName),
        });
        writeFileSync(
          path.join(ARTIFACTS_DIR, 'run-samples.json'),
          JSON.stringify(results, null, 2) + '\n',
        );
      }
    }
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}
