import test from 'node:test';
import assert from 'node:assert/strict';

import { createMarkdownReport, createReportData } from './generate-report.mjs';

test('report data keeps summary and sample details', () => {
  const rows = [
    { version: 'Rspack 1.0.0', run: 1, build_ms: 10, hmr_ms: 20, output_size_kb: 30 },
    { version: 'Rspack 1.0.0', run: 2, build_ms: 14, hmr_ms: 22, output_size_kb: 30 },
    { version: 'Rspack 2.0.0-rc.3', run: 1, build_ms: 8, hmr_ms: 18, output_size_kb: 28 },
    { version: 'Rspack 2.0.0-rc.3', run: 2, build_ms: 12, hmr_ms: 16, output_size_kb: 28 },
  ];
  const meta = {
    samples_per_version: 2,
    benchmark_run_times: 3,
    benchmark_warmup_times: 2,
    versions: ['Rspack 1.0.0', 'Rspack 2.0.0-rc.3'],
  };

  const report = createReportData(rows, meta);
  assert.equal(report.summary['Rspack 1.0.0'].build_ms_median, 12);
  assert.equal(report.summary['Rspack 2.0.0-rc.3'].hmr_ms_median, 17);
  assert.equal(report.samples.length, 4);
});

test('markdown report includes run counts and detailed samples table', () => {
  const markdown = createMarkdownReport({
    meta: {
      samples_per_version: 1,
      benchmark_run_times: 10,
      benchmark_warmup_times: 2,
      versions: ['Rspack 1.0.0'],
    },
    samples: [{ version: 'Rspack 1.0.0', run: 1, build_ms: 10, hmr_ms: 20, output_size_kb: 30 }],
    summary: {
      'Rspack 1.0.0': {
        build_ms_median: 10,
        hmr_ms_median: 20,
        output_size_kb_median: 30,
      },
    },
  });

  assert.match(markdown, /Samples per version: \*\*1\*\*/);
  assert.match(markdown, /Benchmark measured runs per sample: \*\*10\*\*/);
  assert.match(markdown, /Benchmark warmup runs per sample: \*\*2\*\*/);
  assert.match(markdown, /\| Version \| Run \| Build \(ms\) \| HMR \(ms\) \| Output Size \(kB\) \|/);
});
