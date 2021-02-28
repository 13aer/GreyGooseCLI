module.exports = function () {
    runLogin();
}
// ENQUIRER & INQUIRER
const {Input} = require('enquirer');
const { Password } = require('enquirer');

// UTILS
const authHandler = require('../../../backend/bitbucket/auth');
const collector = require('../../../data/interface')
const handler = require('../../utils/handler')

// FORMATTING
const chalk = require('chalk')

// PROMPTS
const menu = require('../main');

/**
 * @name runLogin()
 * @description runs prompt to retrieve the bitbucket username, then forwards the input to password()
 */
function runLogin() {
    const prompt = new Input({
        message: 'Bitbucket Benutzername',
        initial: 'k12345',
    });
    prompt
        .run()
        .then(username => {
            password(username);
        })
        .catch(console.log);
}

/**
 * @name password()
 * @description     runs prompt to retrieve the bitbucket password for the username
 * @param username  username from prompt runLogin()
 */
function password(username) {
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
 * @description validates bitbucket login data
 * @param username  bitbucket username
 * @param password  bitbucket password
 */
async function checkLoginData(username, password) {

    const spinner = handler.getSpinner('Login Daten werden überprüft.').start();
    await collector
        .checkLogin(username, password)
        .then(valid => {
            spinner.stop();
            if (valid) {
                authHandler.setUsername(username);
                authHandler.setPassword(password);
                authHandler.initialize();
                menu();
            } else {
                handler.printHeader();
                handler.printBox(chalk.redBright('Falscher Username oder falsches Passwort.\nBitte versuchen Sie es erneut.'), 'red');
                runLogin();
            }
        })
}


