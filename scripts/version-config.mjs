const RSPACK_2_0_PATCH_VERSIONS = Array.from(
  { length: 9 },
  (_, index) => `2.0.${index}`,
);

function createRspackVersion(version) {
  return {
    key: version,
    label: `Rspack ${version}`,
    toolName: `Rspack CLI ${version}`,
    root: {
      '@rspack/core': version,
      '@rspack/cli': version,
      '@rspack/dev-server': version,
      '@rspack/plugin-react-refresh': version,
    },
    case: {
      '@rspack/core': version,
      '@rspack/cli': version,
      '@rspack/dev-server': version,
      '@rspack/plugin-react-refresh': version,
    },
    webpackDevServerOverride: null,
  };
}

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
  ...RSPACK_2_0_PATCH_VERSIONS.map(createRspackVersion),
  {
    key: '2.1.0-rc.0',
    label: 'Rspack 2.1.0-rc.0',
    toolName: 'Rspack CLI 2.1.0-rc.0',
    root: {
      '@rspack/core': '2.1.0-rc.0',
      '@rspack/cli': '2.1.0-rc.0',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    case: {
      '@rspack/core': '2.1.0-rc.0',
      '@rspack/cli': '2.1.0-rc.0',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    peerDependencyAllowAny: ['@rspack/*'],
    webpackDevServerOverride: null,
  },
  {
    key: 'latest',
    label: 'Rspack latest',
    toolName: 'Rspack CLI',
    root: {
      '@rspack/core': 'latest',
      '@rspack/cli': 'latest',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    case: {
      '@rspack/core': 'latest',
      '@rspack/cli': 'latest',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    webpackDevServerOverride: null,
  },
  {
    key: 'latest-canary',
    label: 'Rspack latest (@rspack-canary/core)',
    toolName: 'Rspack CLI',
    root: {
      '@rspack/core': 'latest',
      '@rspack/cli': 'latest',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    case: {
      '@rspack/core': 'latest',
      '@rspack/cli': 'latest',
      '@rspack/dev-server': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    },
    overrides: {
      '@rspack/core': 'npm:@rspack-canary/core@latest',
    },
    peerDependencyAllowAny: ['@rspack/*'],
    webpackDevServerOverride: null,
  },
];

export const SCENARIO_MATRIX = [
  {
    key: 'default-cache',
    label: 'Memory cache',
    cacheMode: 'default',
    measureDev: true,
    measureHmr: true,
    measureBuildWithCache: false,
    versionKeys: VERSION_MATRIX.map((version) => version.key),
  },
  {
    key: 'persistent-cache',
    label: 'Persistent cache',
    cacheMode: 'persistent',
    measureDev: false,
    measureHmr: false,
    measureBuildWithCache: true,
    versionKeys: [
      '1.7.11',
      ...RSPACK_2_0_PATCH_VERSIONS,
      '2.1.0-rc.0',
      'latest',
      'latest-canary',
    ],
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
