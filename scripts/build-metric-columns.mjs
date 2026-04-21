export function createBuildMetricColumns(
  nameColumn,
  getData,
  options = {},
) {
  const columns = [
    nameColumn,
    { title: 'Build (no cache)', data: getData('prodBuild', 'ms') },
  ];

  if (options.includeBuildWithCache) {
    columns.push({
      title: 'Build (with cache)',
      data: getData('prodHotBuild', 'ms'),
    });
  }

  columns.push(
    { title: 'Memory (RSS)', data: getData('buildRSS', 'MB') },
    { title: 'Output size', data: getData('outputSize', 'kB') },
    { title: 'Gzipped size', data: getData('gzippedSize', 'kB') },
  );

  return columns;
}
