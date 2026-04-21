import test from 'node:test';
import assert from 'node:assert/strict';

import { createMarkdownReport, createReportData } from './generate-report.mjs';

test('report data keeps summary and sample details', () => {
  const rows = [
    {
      scenario_key: 'default-cache',
      scenario_label: 'Memory cache',
      version: 'Rspack 1.0.0',
      run: 1,
      build_ms: 10,
      startup_with_cache_ms: 18,
      hmr_ms: 20,
      output_size_kb: 30,
    },
    {
      scenario_key: 'default-cache',
      scenario_label: 'Memory cache',
      version: 'Rspack 1.0.0',
      run: 2,
      build_ms: 14,
      startup_with_cache_ms: 20,
      hmr_ms: 22,
      output_size_kb: 30,
    },
    {
      scenario_key: 'persistent-cache',
      scenario_label: 'Persistent cache',
      version: 'Rspack 1.7.11',
      run: 1,
      build_ms: 8,
      startup_with_cache_ms: 12,
      hmr_ms: 18,
      output_size_kb: 28,
    },
    {
      scenario_key: 'persistent-cache',
      scenario_label: 'Persistent cache',
      version: 'Rspack 2.0.0-rc.3',
      run: 1,
      build_ms: 12,
      startup_with_cache_ms: 10,
      hmr_ms: 16,
      output_size_kb: 28,
    },
  ];
  const meta = {
    samples_per_version: 2,
    benchmark_run_times: 3,
    benchmark_warmup_times: 2,
    versions: ['Rspack 1.0.0', 'Rspack 2.0.0-rc.3'],
    scenarios: [
      {
        key: 'default-cache',
        label: 'Memory cache',
        versions: ['Rspack 1.0.0'],
      },
      {
        key: 'persistent-cache',
        label: 'Persistent cache',
        versions: ['Rspack 1.7.11', 'Rspack 2.0.0-rc.3'],
      },
    ],
  };

  const report = createReportData(rows, meta);
  assert.equal(report.scenarios[0].summary['Rspack 1.0.0'].build_ms_median, 12);
  assert.equal(
    report.scenarios[1].summary['Rspack 1.7.11'].startup_with_cache_ms_median,
    12,
  );
  assert.equal(report.samples.length, 4);
});

test('markdown report keeps summary sections without detailed sample tables', () => {
  const markdown = createMarkdownReport({
    meta: {
      samples_per_version: 1,
      benchmark_run_times: 10,
      benchmark_warmup_times: 2,
      versions: ['Rspack 1.0.0', 'Rspack 1.7.11', 'Rspack 2.0.0-rc.3'],
      scenarios: [
        {
          key: 'default-cache',
          label: 'Memory cache',
          versions: ['Rspack 1.0.0'],
        },
        {
          key: 'persistent-cache',
          label: 'Persistent cache',
          versions: ['Rspack 1.7.11', 'Rspack 2.0.0-rc.3'],
        },
      ],
    },
    samples: [
      {
        scenario_key: 'default-cache',
        scenario_label: 'Memory cache',
        version: 'Rspack 1.0.0',
        run: 1,
        build_ms: 10,
        startup_with_cache_ms: 18,
        hmr_ms: 20,
        output_size_kb: 30,
      },
      {
        scenario_key: 'persistent-cache',
        scenario_label: 'Persistent cache',
        version: 'Rspack 1.7.11',
        run: 1,
        build_ms: 8,
        startup_with_cache_ms: 12,
        hmr_ms: 18,
        output_size_kb: 28,
      },
    ],
    scenarios: [
      {
        key: 'default-cache',
        label: 'Memory cache',
        summary: {
          'Rspack 1.0.0': {
            build_ms_median: 10,
            hmr_ms_median: 20,
            output_size_kb_median: 30,
          },
        },
      },
      {
        key: 'persistent-cache',
        label: 'Persistent cache',
        summary: {
          'Rspack 1.7.11': {
            build_ms_median: 8,
            startup_with_cache_ms_median: 12,
            output_size_kb_median: 28,
          },
        },
      },
    ],
  });

  assert.match(markdown, /Samples per version: \*\*1\*\*/);
  assert.match(markdown, /Benchmark measured runs per sample: \*\*10\*\*/);
  assert.match(markdown, /Benchmark warmup runs per sample: \*\*2\*\*/);
  assert.match(markdown, /## Memory cache/);
  assert.match(markdown, /## Persistent cache/);
  assert.doesNotMatch(markdown, /Detailed Samples/);
  assert.doesNotMatch(markdown, /\| Version \| Run \|/);
  assert.doesNotMatch(markdown, /\| Version \| Build Median \(ms\) \| Startup With Cache Median \(ms\) \| HMR Median \(ms\) \| Output Size Median \(kB\) \|/);
  assert.match(markdown, /\| Version \| Build Median \(ms\) \| Startup With Cache Median \(ms\) \| Output Size Median \(kB\) \|/);
});
