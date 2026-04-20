import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BENCHMARK_RUN_TIMES,
  DEFAULT_BENCHMARK_WARMUP_TIMES,
  DEFAULT_SAMPLES_PER_VERSION,
} from './run-three-rspack-versions.mjs';

test('default sampling strategy uses one outer sample and ten inner measured runs', () => {
  assert.equal(DEFAULT_SAMPLES_PER_VERSION, 1);
  assert.equal(DEFAULT_BENCHMARK_RUN_TIMES, 10);
  assert.equal(DEFAULT_BENCHMARK_WARMUP_TIMES, 2);
});
