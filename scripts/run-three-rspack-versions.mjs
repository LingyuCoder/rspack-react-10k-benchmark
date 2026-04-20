import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { VERSION_MATRIX } from './version-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CASE_DIR = path.join(ROOT, 'cases/react-10k');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');

function runShell(command, cwd = ROOT) {
  return execFileSync('/bin/zsh', ['-lc', command], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function extractRow(text, toolName, marker) {
  const section = text.slice(text.indexOf(marker));
  const line = section
    .split('\n')
    .find((item) => item.startsWith('|') && item.includes(toolName));
  if (!line) {
    throw new Error(`Unable to find ${toolName} row in ${marker}`);
  }
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseRunMetrics(stdout, toolName) {
  const devRow = extractRow(stdout, toolName, 'Development metrics:');
  const buildRow = extractRow(stdout, toolName, 'Build metrics:');
  return {
    build_ms: Number.parseInt(buildRow[1], 10),
    hmr_ms: Number.parseInt(devRow[3], 10),
    output_size_kb: Number.parseFloat(buildRow[4]),
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
  const sampleCount = Number.parseInt(process.env.RUNS ?? '10', 10);
  const results = [];

  for (const version of VERSION_MATRIX) {
    console.log(`\n=== ${version.label} ===`);
    setVersion(version);

    for (let run = 1; run <= sampleCount; run += 1) {
      console.log(`Running ${version.label} sample ${run}/${sampleCount}`);
      const stdout = runShell(
        `npx -y -p node@24.14.1 -c 'CASE=react-10k TOOLS=rspack RUN_TIMES=1 WARMUP_TIMES=0 corepack pnpm benchmark'`,
      );
      writeFileSync(path.join(ARTIFACTS_DIR, `${version.key}-run-${run}.txt`), stdout);
      results.push({
        version: version.label,
        run,
        ...parseRunMetrics(stdout, version.toolName),
      });
      writeFileSync(path.join(ARTIFACTS_DIR, 'run-samples.json'), JSON.stringify(results, null, 2) + '\n');
    }
  }
}

main();
