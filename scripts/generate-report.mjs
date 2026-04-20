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

export function createReportData(rows, meta) {
  const versions = meta.versions;
  const summary = Object.fromEntries(
    versions.map((version) => {
      const subset = rows.filter((row) => row.version === version);
      return [
        version,
        {
          build_ms_median: median(subset.map((row) => row.build_ms)),
          hmr_ms_median: median(subset.map((row) => row.hmr_ms)),
          output_size_kb_median: median(subset.map((row) => row.output_size_kb)),
        },
      ];
    }),
  );

  return {
    meta,
    samples: rows,
    summary,
  };
}

export function createMarkdownReport(reportData) {
  const { meta, samples: rows, summary } = reportData;
  const versions = meta.versions;

  const tableRows = [
    '| Version | Build Median (ms) | HMR Median (ms) | Output Size Median (kB) |',
    '| --- | ---: | ---: | ---: |',
    ...versions.map(
      (version) =>
        `| ${version} | ${summary[version].build_ms_median} | ${summary[version].hmr_ms_median} | ${summary[version].output_size_kb_median} |`,
    ),
  ];

  const detailedRows = [
    '| Version | Run | Build (ms) | HMR (ms) | Output Size (kB) |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...rows.map(
      (row) =>
        `| ${row.version} | ${row.run} | ${row.build_ms} | ${row.hmr_ms} | ${row.output_size_kb} |`,
    ),
  ];

  return [
    '# Rspack React-10k Benchmark Report',
    '',
    `Samples per version: **${meta.samples_per_version}**`,
    `Benchmark measured runs per sample: **${meta.benchmark_run_times}**`,
    `Benchmark warmup runs per sample: **${meta.benchmark_warmup_times}**`,
    '',
    '## Summary',
    '',
    ...tableRows,
    '',
    '## Detailed Samples',
    '',
    ...detailedRows,
    '',
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
