import test from 'node:test';
import assert from 'node:assert/strict';

import { createBuildMetricColumns } from './build-metric-columns.mjs';

test('build metric columns exclude the with-cache column', () => {
  const columns = createBuildMetricColumns(
    { title: 'Name', data: ['Rspack'] },
    (fieldName, unit) => [`${fieldName}-${unit}`],
  );

  assert.deepEqual(
    columns.map((column) => column.title),
    ['Name', 'Build (no cache)', 'Memory (RSS)', 'Output size', 'Gzipped size'],
  );
});
