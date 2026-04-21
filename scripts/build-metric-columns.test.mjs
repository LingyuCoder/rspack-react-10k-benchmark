import test from 'node:test';
import assert from 'node:assert/strict';

import { createBuildMetricColumns } from './build-metric-columns.mjs';

test('build metric columns exclude the with-cache column by default', () => {
  const columns = createBuildMetricColumns(
    { title: 'Name', data: ['Rspack'] },
    (fieldName, unit) => [`${fieldName}-${unit}`],
  );

  assert.deepEqual(
    columns.map((column) => column.title),
    ['Name', 'Build (no cache)', 'Memory (RSS)', 'Output size', 'Gzipped size'],
  );
});

test('build metric columns can include the with-cache build column', () => {
  const columns = createBuildMetricColumns(
    { title: 'Name', data: ['Rspack'] },
    (fieldName, unit) => [`${fieldName}-${unit}`],
    { includeBuildWithCache: true },
  );

  assert.deepEqual(
    columns.map((column) => column.title),
    [
      'Name',
      'Build (no cache)',
      'Build (with cache)',
      'Memory (RSS)',
      'Output size',
      'Gzipped size',
    ],
  );
});
