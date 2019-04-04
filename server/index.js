#!/usr/bin/env node
/* eslint-disable no-console */

const path = require("path");
const express = require("express");
const argparse = require('argparse');
const webpack = require("webpack");
const generateWebpackConfig = require("../webpack.config.js").default;
const utils = require("./utils");
const addHandlers = require("./api").addHandlers;
const compression = require('compression');
const nakedRedirect = require('express-naked-redirect');
const expressStaticGzip = require("express-static-gzip");

/* COMMAND LINE ARGUMENTS */
const parser = new argparse.ArgumentParser({
  version: utils.version,
  addHelp: true,
  description: `Seattle Flu Genomic Incidence Tracker version ${utils.version}.`
});
const subparsers = parser.addSubparsers({title: 'Available subcommands', dest: "subcommand"});
/* arguments for the "develop" mode (hot reloading etc etc) */
const developSubparser = subparsers.addParser('develop', {addHelp: true, description: `
  Launch the development server.
  This uses hot-reloading to allow automatic updating as you edit the code, but there is a speed penalty for this.
  This should never be used for production.
`});
developSubparser.addArgument('--verbose', {action: "storeTrue", help: "verbose logging"});
/* arguments for the "build" mode (simple webpack compilation) */
const buildSubparser = subparsers.addParser('build', {addHelp: true, description: `
  Build the client source code.
  For development, you may want to use "npm run dev" which recompiles code on the fly as changes are made.
  To serve the built code, run "npm run view".
`});
buildSubparser.addArgument('--verbose', {action: "storeTrue", help: "verbose logging"});
buildSubparser.addArgument('--analyzeBundle', {action: "storeTrue", help: "Interactive bundle analyzer tool"});
/* arguments for the "view" mode (serve bundle only) */
const viewSubparser = subparsers.addParser('view', {addHelp: true, description: `
Launch a local server to serve the Genomic Incidence Tracker.
`});
viewSubparser.addArgument('--verbose', {action: "storeTrue", help: "verbose logging"});

const args = parser.parseArgs();
if (args.verbose) global.VERBOSE = true;


if (args.subcommand === "build") {
  /* IF WE'RE BUILDING THE BUNDLE, WE DON'T NEED ANY SERVER */
  const webpackConfig = generateWebpackConfig({devMode: false, analyzeBundle: args.analyzeBundle});
  const compiler = webpack(webpackConfig);

  /* variables available to babel (which is called by webpack) */
  process.env.BABEL_ENV = "production";

  compiler.run((err, stats) => {
    if (err) {
      console.error(err);
      process.exit(2);
    }
    if (stats.hasErrors()) {
      console.log(stats.toString({colors: true}));
      utils.error("Webpack built with errors. Exiting.");
    } else {
      if (stats.hasWarnings()) {
        utils.warn("Webpack has warnings (run with '--verbose' to see them)");
      }
      if (global.VERBOSE) {
        console.log(stats.toString({colors: true}));
      }
    }
  });
} else {
  /* SET UP SERVER */
  const baseDir = path.resolve(__dirname, "..");
  const app = express();
  app.set('port', process.env.PORT || 4000);
  /* some settings are not used in dev mode */
  if (args.subcommand === "view") {
    app.use(compression());
    app.use(nakedRedirect({reverse: true})); /* redirect www.name.org to name.org */
    app.get("/favicon.png", (req, res) => {res.sendFile(path.join(baseDir, "favicon.png"));});
    const distDir = path.join(baseDir, "dist");
    app.use("/dist", expressStaticGzip(distDir));
    app.use(express.static(distDir));
  }

  /* COMPILE CLIENT IN DEV MODE WITH WEBPACK (IF NEEDED) */
  if (args.subcommand === "develop") {
    const webpackConfig = generateWebpackConfig({devMode: true});
    const compiler = webpack(webpackConfig);

    /* variables available to babel (which is called by webpack) */
    process.env.BABEL_ENV = args.subcommand === "develop" ? "development" : "production";
    const webpackDevMiddleware = require("webpack-dev-middleware"); // eslint-disable-line
    const webpackHotMiddleware = require("webpack-hot-middleware"); // eslint-disable-line
    app.use((webpackDevMiddleware)(
      compiler,
      {logLevel: 'warn', publicPath: webpackConfig.output.publicPath}
    ));
    app.use((webpackHotMiddleware)(
      compiler,
      {log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000}
    ));
  }


  /* add API handlers -- see "./api.js" for more details */
  addHandlers(app);
  /* serve index.html (which has the client JS bundle) for any unhandled requests */
  /* this must be the last "get" handler, else the "*" swallows all other requests */
  app.get("*", (req, res) => {
    res.sendFile(path.join(baseDir, "index.html"));
  });


  const server = app.listen(app.get('port'), () => {
    utils.log("\n\n---------------------------------------------------");
    utils.log(`Seattle Flu Genomic Incidence Tracker version ${utils.version}`);
    args.subcommand === "develop" ?
      utils.log("Running in development mode") :
      utils.log("Serving the pre-compiled client bundle (dist/bundle.js)");
    utils.log(`Access the client at: http://localhost:${server.address().port}`);
    utils.log("---------------------------------------------------\n\n");
  });

}

