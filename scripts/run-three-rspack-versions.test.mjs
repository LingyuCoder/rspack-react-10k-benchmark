import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BENCHMARK_RUN_TIMES,
  DEFAULT_BENCHMARK_WARMUP_TIMES,
  DEFAULT_SAMPLES_PER_VERSION,
  parseRunMetrics,
} from './run-three-rspack-versions.mjs';
import { SCENARIO_MATRIX } from './version-config.mjs';

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

const PERSISTENT_SAMPLE_STDOUT = `
Build metrics:

| Name | Build (no cache) | Memory (RSS) | Output size | Gzipped size |
| --- | --- | --- | --- | --- |
| Rspack CLI 2.0.0-rc.3 | 2030ms | 900MB | 5934.3kB | 1368.1kB |

Development metrics:

| Name | Startup (no cache) | Startup (with cache) | Memory (RSS) |
| --- | --- | --- | --- |
| Rspack CLI 2.0.0-rc.3 | 1000ms | 800ms | 350MB |
`;

test('default sampling strategy uses one outer sample and ten inner measured runs', () => {
  assert.equal(DEFAULT_SAMPLES_PER_VERSION, 1);
  assert.equal(DEFAULT_BENCHMARK_RUN_TIMES, 10);
  assert.equal(DEFAULT_BENCHMARK_WARMUP_TIMES, 2);
});

test('runner keeps a dedicated persistent-cache scenario for 1.7.11 and rc.3 only', () => {
  assert.deepEqual(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.versionKeys,
    ['1.7.11', '2.0.0-rc.3'],
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'default-cache')?.label,
    'Memory cache',
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.measureHmr,
    false,
  );
});

test('output size and startup-with-cache are parsed from the correct columns', () => {
  assert.deepEqual(parseRunMetrics(SAMPLE_STDOUT, 'Rspack CLI 2.0.0-rc.3'), {
    build_ms: 2030,
    startup_with_cache_ms: 800,
    hmr_ms: 93,
    output_size_kb: 5934.3,
  });
});

test('persistent-cache metrics parse without an HMR column', () => {
  assert.deepEqual(
    parseRunMetrics(PERSISTENT_SAMPLE_STDOUT, 'Rspack CLI 2.0.0-rc.3'),
    {
      build_ms: 2030,
      startup_with_cache_ms: 800,
      hmr_ms: undefined,
      output_size_kb: 5934.3,
    },
  );
});
