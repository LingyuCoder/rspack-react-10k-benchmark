import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BENCHMARK_RUN_TIMES,
  DEFAULT_BENCHMARK_WARMUP_TIMES,
  DEFAULT_SAMPLES_PER_VERSION,
} from './run-three-rspack-versions.mjs';

const SAMPLE_STDOUT = `
Build metrics:

| Name | Build (no cache) | Memory (RSS) | Output size | Gzipped size |
| --- | --- | --- | --- | --- |
| Rspack CLI 2.0.0-rc.3 | 2030ms | 900MB | 5934.3kB | 1368.1kB |

Development metrics:

| Name | Startup (no cache) | Startup (with cache) | HMR | Memory (RSS) |
| --- | --- | --- | --- | --- |
| Rspack CLI 2.0.0-rc.3 | 1000ms | 800ms | 93ms | 350MB |
`;

function parseRunMetricsForTest(stdout, toolName) {
  const extractRow = (text, name, marker) => {
    const section = text.slice(text.indexOf(marker));
    const line = section
      .split('\n')
      .find((item) => item.startsWith('|') && item.includes(name));
    return line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
  };
  const devRow = extractRow(stdout, toolName, 'Development metrics:');
  const buildRow = extractRow(stdout, toolName, 'Build metrics:');
  return {
    build_ms: Number.parseInt(buildRow[1], 10),
    hmr_ms: Number.parseInt(devRow[3], 10),
    output_size_kb: Number.parseFloat(buildRow[3]),
  };
}

test('default sampling strategy uses one outer sample and ten inner measured runs', () => {
  assert.equal(DEFAULT_SAMPLES_PER_VERSION, 1);
  assert.equal(DEFAULT_BENCHMARK_RUN_TIMES, 10);
  assert.equal(DEFAULT_BENCHMARK_WARMUP_TIMES, 2);
});

test('output size is parsed from the output-size column, not gzipped-size', () => {
  assert.deepEqual(parseRunMetricsForTest(SAMPLE_STDOUT, 'Rspack CLI 2.0.0-rc.3'), {
    build_ms: 2030,
    hmr_ms: 93,
    output_size_kb: 5934.3,
  });
});
