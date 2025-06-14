module.exports = function override(config, env) {
  if (env === "production") {
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== "ReactRefreshPlugin"
    );
  }
  return config;
};
