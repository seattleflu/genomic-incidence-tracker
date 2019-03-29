/* eslint no-console: off */
const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require('compression-webpack-plugin');
const utils = require('./server/utils');


/* Webpack config generator */

const generateConfig = ({devMode=false, analyzeBundle=false}) => {
  utils.verbose(`Generating webpack config. devMode: ${devMode}`);

  /* which directories should be parsed by babel and other loaders? */
  const directoriesToTransform = [path.join(__dirname, 'src')];

  /* plugins */
  /* plugin: inject strings into the client-accessible process.env */
  const pluginProcessEnvData = new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: devMode ? JSON.stringify("development") : JSON.stringify("production")
    }
  });
  /* plugin: gzip everything - https://github.com/webpack-contrib/compression-webpack-plugin */
  const pluginCompress = new CompressionPlugin({
    filename: "[path].gz[query]",
    algorithm: "gzip",
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8
  });
  const plugins = devMode ? [
    new webpack.HotModuleReplacementPlugin(),
    pluginProcessEnvData,
    new webpack.NoEmitOnErrorsPlugin()
  ] : [
    pluginProcessEnvData,
    new webpack.optimize.AggressiveMergingPlugin(), // merge chunks - https://github.com/webpack/docs/wiki/list-of-plugins#aggressivemergingplugin
    pluginCompress
  ];

  if (analyzeBundle) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // eslint-disable-line
    plugins.push(new BundleAnalyzerPlugin());
  }

  const entry = [
    "babel-polyfill",
    "./src/index"
  ];
  if (devMode) {
    entry.splice(1, 0, "webpack-hot-middleware/client");
  }

  /* Where do we want the output to be saved?
   * For development we use the (virtual) "devel" directory
   * Else we must choose to save it in the CWD or the source
   */
  const outputPath = devMode ?
    path.resolve(__dirname, "devel") : // development: use the (virtual) "devel" directory
    path.resolve(__dirname, "dist");
  utils.verbose(`Webpack writing output to: ${outputPath}`);

  const config = {
    mode: devMode ? 'development' : 'production',
    context: __dirname,
    entry,
    output: {
      path: outputPath,
      filename: "bundle.js",
      publicPath: "/dist/"
    },
    node: {
      fs: 'empty'
    },
    plugins,
    optimization: {
      minimize: !devMode
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: directoriesToTransform,
          options: {
            cwd: path.resolve(__dirname)
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: "file-loader",
          include: directoriesToTransform
        }
      ]
    }
  };

  config.devtool = 'cheap-module-source-map';

  return config;
};

module.exports = {default: generateConfig};
