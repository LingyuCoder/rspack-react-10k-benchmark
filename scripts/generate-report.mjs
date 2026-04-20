import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');
const INPUT_JSON = path.join(ARTIFACTS_DIR, 'run-samples.json');
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

function main() {
  const rows = JSON.parse(readFileSync(INPUT_JSON, 'utf8'));
  const versions = ['Rspack 1.0.0', 'Rspack 1.7.11', 'Rspack 2.0.0-rc.2'];
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

  writeFileSync(
    OUTPUT_JSON,
    JSON.stringify(
      {
        samples: rows,
        summary,
      },
      null,
      2,
    ) + '\n',
  );

  const tableRows = [
    '| Version | Build Median (ms) | HMR Median (ms) | Output Size Median (kB) |',
    '| --- | ---: | ---: | ---: |',
    ...versions.map(
      (version) =>
        `| ${version} | ${summary[version].build_ms_median} | ${summary[version].hmr_ms_median} | ${summary[version].output_size_kb_median} |`,
    ),
  ];

  writeFileSync(
    OUTPUT_MD,
    [
      '# Rspack React-10k Benchmark Report',
      '',
      'Median values from the collected run samples.',
      '',
      ...tableRows,
      '',
      `Raw samples: \`${path.basename(INPUT_JSON)}\``,
    ].join('\n') + '\n',
  );
}

main();
