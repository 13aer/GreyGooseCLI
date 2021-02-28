
const chalk = require('chalk');

global.ERROR = chalk.bold.red;
global.HIGHLIGHT = chalk.magentaBright;
global.NOTE = chalk.blueBright;
global.INFO = chalk.green;
global.IMPORTANT = chalk.yellow;
global.WARNING = chalk.bold.keyword('orange');
global.BRIGHT = chalk.whiteBright.bold.underline
global.SUBNOTE = chalk.cyanBright