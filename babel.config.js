/* What variables does this config depend on?
 * api.env -- this is process.env.BABEL_ENV if it exists (it should)
 */
const utils = require('./server/utils');

module.exports = function babelConfig(api) {
  utils.verbose(`Generating Babel Config`);
  const presets = [
    ["@babel/env", {targets: {node: "10"}}], // target needed for async/await
    "@babel/preset-react"
  ];
  const plugins = [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    "@babel/plugin-proposal-class-properties",
    "babel-plugin-styled-components",
    "@babel/plugin-syntax-dynamic-import"
  ];
  if (api.env("development")) {
    utils.verbose(`(hot reloading enabled in babel config)`);
    plugins.push("react-hot-loader/babel");
  }
  api.cache(true);
  return {
    presets,
    plugins
  };
};

