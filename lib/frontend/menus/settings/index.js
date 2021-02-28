// ENQUIRER & INQUIRER
const { Select } = require('enquirer');
const { Input } = require('enquirer');
const { Password } = require('enquirer');

// UTILS
let authHandler = require("../../../backend/bitbucket/auth");
const collector = require('../../../data/interface')
const handler = require('../../utils/handler')
const main = require('../main')
const chalk = require('chalk');
require('../../utils/globals')

// DATA
const loginData = 'Bitbucket Login Daten ändern'
const mainmenu = HIGHLIGHT('Zurück zum Hauptmenü')

module.exports = function () {
    select();
}

/**
 * prompt for selecting what the user wants to do next
 * 2 choices: edit bitbucket login data or go back to main menu
 */
function select() {
    handler.printHeader();
    const prompt = new Select({
        name: 'select',
        message: 'Was möchten Sie machen?',
        choices: [loginData, mainmenu]
    });

    prompt
        .run()
        .then(answer => {
            switch (answer) {
                case loginData:
                    getUsername();
                    break;
                case mainmenu:
                    main();
                    break;
            }
        })
        .catch(console.log);
}

/**
 * prompt to retrieve the new username
 */
function getUsername() {
    const prompt = new Input({
        message: 'Bitbucket Benutzername',
        initial: authHandler.username,
    });
    prompt
        .run()
        .then(username => {
            getPassword(username);
        })
        .catch(console.log);
}

/**
 * prompt to retrieve the new password
 * @param username  earlier inserted username @getUsername()
 */
function getPassword(username) {
    const prompt = new Password({
        name: 'password',
        message: 'Bitbucket Passwort'
    });
    prompt
        .run()
        .then(password => {
            checkLoginData(username, password).then().catch(console.log);
        })
        .catch(console.log);
}

/**
 * @name checkLoginData()
 * @description     This function takes the new values for username and password and checks if they are valid Bitbucket Login Data
 * @description     If they are not valid, the user is asked to insert the data again
 * @description     If they are valid, the Authentication file will be altered
 * @param username  getUsername() prompt result
 * @param password  getPassword() prompt result
 * @return {Promise<void>}
 */
async function checkLoginData(username, password) {

    const spinner = handler.getSpinner('Login Daten werden überprüft.').start();
    await collector
        .checkLogin(username, password)
        .then(valid => {
            spinner.stop();
            if (valid) {
                authHandler.reset();
                authHandler.setUsername(username)
                authHandler.setPassword(password)
                authHandler.initialize()
                select();
            } else {
                handler.printHeader();
                handler.printBox(chalk.redBright('Authentifizierung fehlgeschlagen für neue Login Daten.\nBitte versuchen Sie es erneut.'), 'red');
                getUsername();
            }
        })
}