/* eslint no-console: off */
const chalk = require('chalk');
const version = require('../package.json').version;

const verbose = (msg) => {
  if (global.VERBOSE) {
    console.log(chalk.greenBright(`[verbose]\t${msg}`));
  }
};
const log = (msg) => {
  console.log(chalk.blueBright(msg));
};
const warn = (msg) => {
  console.warn(chalk.yellowBright(`[warning]\t${msg}`));
};
const error = (msg) => {
  console.error(chalk.redBright(`[error]\t${msg}`));
  process.exit(2);
};


module.exports = {
  verbose,
  log,
  warn,
  error,
  version
};
