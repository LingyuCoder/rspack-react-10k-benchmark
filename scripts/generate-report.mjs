import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');
const INPUT_JSON = path.join(ARTIFACTS_DIR, 'run-samples.json');
const META_JSON = path.join(ARTIFACTS_DIR, 'run-meta.json');
const OUTPUT_JSON = path.join(ARTIFACTS_DIR, 'report.json');
const OUTPUT_MD = path.join(ARTIFACTS_DIR, 'report.md');

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

const DEFAULT_SCENARIO = {
  key: 'default-cache',
  label: 'Memory cache',
};

function medianOrUndefined(values) {
  return values.length > 0 ? median(values) : undefined;
}

function getScenarios(meta, rows) {
  if (Array.isArray(meta.scenarios) && meta.scenarios.length > 0) {
    return meta.scenarios;
  }

  return [
    {
      ...DEFAULT_SCENARIO,
      versions: meta.versions ?? [...new Set(rows.map((row) => row.version))],
    },
  ];
}

function getScenarioSummaryColumns(scenarioKey) {
  if (scenarioKey === 'persistent-cache') {
    return [
      ['build_ms_median', 'Build Median (ms)'],
      ['startup_with_cache_ms_median', 'Startup With Cache Median (ms)'],
      ['output_size_kb_median', 'Output Size Median (kB)'],
    ];
  }

  return [
    ['build_ms_median', 'Build Median (ms)'],
    ['hmr_ms_median', 'HMR Median (ms)'],
    ['output_size_kb_median', 'Output Size Median (kB)'],
  ];
}

export function createReportData(rows, meta) {
  const scenarios = getScenarios(meta, rows).map((scenario) => {
    const scenarioRows = rows.filter((row) => {
      const rowScenarioKey = row.scenario_key ?? DEFAULT_SCENARIO.key;
      return rowScenarioKey === scenario.key;
    });
    const versions = scenario.versions ?? [...new Set(scenarioRows.map((row) => row.version))];
    const summary = Object.fromEntries(
      versions.map((version) => {
        const subset = scenarioRows.filter((row) => row.version === version);
        return [
          version,
          {
            build_ms_median: medianOrUndefined(subset.map((row) => row.build_ms)),
            startup_with_cache_ms_median: medianOrUndefined(
              subset
                .map((row) => row.startup_with_cache_ms)
                .filter((value) => typeof value === 'number'),
            ),
            hmr_ms_median: medianOrUndefined(
              subset
                .map((row) => row.hmr_ms)
                .filter((value) => typeof value === 'number'),
            ),
            output_size_kb_median: medianOrUndefined(
              subset.map((row) => row.output_size_kb),
            ),
          },
        ];
      }),
    );

    return {
      ...scenario,
      versions,
      summary,
      samples: scenarioRows,
    };
  });

  return {
    meta,
    samples: rows,
    scenarios,
  };
}

export function createMarkdownReport(reportData) {
  const { meta, scenarios } = reportData;

  const sections = scenarios.flatMap((scenario) => {
    const summaryColumns = getScenarioSummaryColumns(scenario.key);
    const scenarioVersions = scenario.versions ?? Object.keys(scenario.summary);
    const summaryHeader = ['Version', ...summaryColumns.map(([, label]) => label)];

    const summaryRows = [
      `## ${scenario.label}`,
      '',
      '| ' + summaryHeader.join(' | ') + ' |',
      '| ' + summaryHeader.map((_, index) => (index === 0 ? '---' : '---:')).join(' | ') + ' |',
      ...scenarioVersions.map((version) => {
        const metrics = scenario.summary[version];
        return (
          '| ' +
          [version, ...summaryColumns.map(([key]) => metrics[key])]
            .join(' | ') +
          ' |'
        );
      }),
      '',
    ];

    return summaryRows;
  });

  return [
    '# Rspack React-10k Benchmark Report',
    '',
    `Samples per version: **${meta.samples_per_version}**`,
    `Benchmark measured runs per sample: **${meta.benchmark_run_times}**`,
    `Benchmark warmup runs per sample: **${meta.benchmark_warmup_times}**`,
    '',
    ...sections,
    `Raw samples: \`${path.basename(INPUT_JSON)}\``,
    `Run metadata: \`${path.basename(META_JSON)}\``,
  ].join('\n') + '\n';
}

function main() {
  const rows = JSON.parse(readFileSync(INPUT_JSON, 'utf8'));
  const meta = JSON.parse(readFileSync(META_JSON, 'utf8'));
  const reportData = createReportData(rows, meta);

  writeFileSync(OUTPUT_JSON, JSON.stringify(reportData, null, 2) + '\n');
  writeFileSync(OUTPUT_MD, createMarkdownReport(reportData));
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main();
}
