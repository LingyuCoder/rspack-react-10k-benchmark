export function resolveReactRefreshRspackPlugin(moduleNamespace) {
  if (typeof moduleNamespace === 'function') {
    return moduleNamespace;
  }

  if (typeof moduleNamespace?.ReactRefreshRspackPlugin === 'function') {
    return moduleNamespace.ReactRefreshRspackPlugin;
  }

  if (typeof moduleNamespace?.default === 'function') {
    return moduleNamespace.default;
  }

  if (
    typeof moduleNamespace?.default?.ReactRefreshRspackPlugin === 'function'
  ) {
    return moduleNamespace.default.ReactRefreshRspackPlugin;
  }

  throw new Error('Unable to resolve ReactRefreshRspackPlugin export');
}
