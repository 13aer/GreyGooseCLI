#!/usr/bin/env node
const {Command} = require('commander');
const chalk = require("chalk");
const program = new Command();
const {description, version} = require('./package.json');
const menu = require('./lib/frontend/menus/main');
const login = require('./lib/frontend/menus/login');
const settings = require("./lib/frontend/menus/settings");
const authHandler = require('./lib/backend/bitbucket/auth')
const collector = require('./lib/data/interface')
const handler = require('./lib/frontend/utils/handler')

/**
 * @description adds description and version tag + version flag for CLI-call
 * @description calls base-level-menu on default, or login-menu if credentials are unset
 */
program
    .description(description)
    .version(version, '-v, -version', 'Show version')
    .action(async () => {
        if (authHandler.exists() && authHandler.getCredentials().username !== 'NOTHING' && authHandler.getCredentials().password !== 'NOTHING') {
            checkLoginData().then().catch(console.log);
        } else {
            handler.printHeader();
            login();
        }
    });

async function checkLoginData() {
    const spinner = handler.getSpinner('Sie werden angemeldet...').start();
    await collector
        .checkLogin(authHandler.getCredentials().username, authHandler.getCredentials().password)
        .then(valid => {
            spinner.stop();
            if (valid) {
                menu();
            } else {
                authHandler.reset();
                handler.printHeader();
                handler.printBox(chalk.redBright('Authentifizierung fehlgeschlagen.\nBitte geben Sie Ihre Anmeldedaten erneut ein.'), 'red');
                login();
            }
        })
}

/**
 * @description adds login command to CLI to instant access the login-menu
 */
program
    .command('login')
    .description('Login to Bitbucket Server')
    .action(async () => {
        handler.printHeader();
        login();
    });

/**
 * @description adds settings command to CLI to instant access the settings-menu
 */
program
    .command('settings')
    .description('Change settings')
    .action(async () => {
        handler.printHeader();
        settings();
    });

/**
 * @description adds command to show the path of the stored Files on the console
 */
program
    .command('where')
    .description('Shows the path of the stored files')
    .action(function () {
        console.log(collector.showPath());
    });

/**************************************************NEEDS TO STAY AT BOTTOM*********************************************/

/**
 * @description enables commander to read the console-input
 */
program.parse();