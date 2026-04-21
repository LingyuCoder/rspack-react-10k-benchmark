export const VERSION_MATRIX = [
  {
    key: '1.0.0',
    label: 'Rspack 1.0.0',
    toolName: 'Rspack CLI 1.0.0',
    root: {
      '@rspack/core': '1.0.0',
      '@rspack/cli': '1.0.0',
      '@rspack/dev-server': '1.0.0',
      '@rspack/plugin-react-refresh': '1.0.0',
    },
    case: {
      '@rspack/core': '1.0.0',
      '@rspack/cli': '1.0.0',
      '@rspack/dev-server': '1.0.0',
      '@rspack/plugin-react-refresh': '1.0.0',
    },
    webpackDevServerOverride: '5.0.4',
  },
  {
    key: '1.7.11',
    label: 'Rspack 1.7.11',
    toolName: 'Rspack CLI 1.7.11',
    root: {
      '@rspack/core': '1.7.11',
      '@rspack/cli': '1.7.11',
      '@rspack/dev-server': '1.1.5',
      '@rspack/plugin-react-refresh': '1.6.2',
    },
    case: {
      '@rspack/core': '1.7.11',
      '@rspack/cli': '1.7.11',
      '@rspack/dev-server': '1.1.5',
      '@rspack/plugin-react-refresh': '1.6.2',
    },
    webpackDevServerOverride: null,
  },
  {
    key: '2.0.0-rc.3',
    label: 'Rspack 2.0.0-rc.3',
    toolName: 'Rspack CLI 2.0.0-rc.3',
    root: {
      '@rspack/core': '2.0.0-rc.3',
      '@rspack/cli': '2.0.0-rc.3',
      '@rspack/dev-server': '2.0.0-rc.3',
      '@rspack/plugin-react-refresh': '2.0.0',
    },
    case: {
      '@rspack/core': '2.0.0-rc.3',
      '@rspack/cli': '2.0.0-rc.3',
      '@rspack/dev-server': '2.0.0-rc.3',
      '@rspack/plugin-react-refresh': '2.0.0',
    },
    webpackDevServerOverride: null,
  },
];

export const SCENARIO_MATRIX = [
  {
    key: 'default-cache',
    label: 'Memory cache',
    cacheMode: 'default',
    measureHmr: true,
    versionKeys: VERSION_MATRIX.map((version) => version.key),
  },
  {
    key: 'persistent-cache',
    label: 'Persistent cache',
    cacheMode: 'persistent',
    measureHmr: false,
    versionKeys: ['1.7.11', '2.0.0-rc.3'],
  },
];

export function getVersionsForScenario(scenario) {
  return scenario.versionKeys.map((versionKey) => {
    const version = VERSION_MATRIX.find((item) => item.key === versionKey);
    if (!version) {
      throw new Error(`Unknown Rspack version "${versionKey}" in scenario "${scenario.key}"`);
    }
    return version;
  });
}

export function getSelectedScenarios(selectedKeys = process.env.SCENARIOS) {
  if (!selectedKeys) {
    return SCENARIO_MATRIX;
  }

  const keys = selectedKeys
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const selected = SCENARIO_MATRIX.filter((scenario) => keys.includes(scenario.key));

  if (selected.length !== keys.length) {
    const known = new Set(selected.map((scenario) => scenario.key));
    const unknownKeys = keys.filter((key) => !known.has(key));
    throw new Error(`Unknown benchmark scenario(s): ${unknownKeys.join(', ')}`);
  }

  return selected;
}
