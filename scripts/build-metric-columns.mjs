export function createBuildMetricColumns(nameColumn, getData) {
  return [
    nameColumn,
    { title: 'Build (no cache)', data: getData('prodBuild', 'ms') },
    { title: 'Memory (RSS)', data: getData('buildRSS', 'MB') },
    { title: 'Output size', data: getData('outputSize', 'kB') },
    { title: 'Gzipped size', data: getData('gzippedSize', 'kB') },
  ];
}
