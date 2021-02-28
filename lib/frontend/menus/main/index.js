module.exports = function () {
    handler.printHeader();
    mainMenu();
}
// IMPORTS: GENERAL
const CREATE_REPOSITORY = require('../create')
const EDIT_REPOSITORY = require('../edit')
const SETTINGS = require('../settings')

// IMPORTS: ENQUIRER & INQUIRER
const { Select } = require('enquirer');

// IMPORTS: HANDLER, CONVERTER, VALIDATOR
const handler = require('../../utils/handler')

// IMPORTS: FORMAT CONSOLE OUTPUT
const clear = require('clear');

// GLOBAL MESSAGES
require('../../utils/globals')

// DATA
const create = 'Neues Examen erstellen' + '\t' + NOTE('Parallel and Distributed Systems')
const edit = 'Examen bearbeiten'
const settings = 'Einstellungen'
const exit = HIGHLIGHT('Exit')

// PROMPTS
function mainMenu() {

    const prompt = new Select({
        name: 'Menu',
        message: HIGHLIGHT('Was möchten Sie machen?'),
        choices: [create, edit, settings, exit]
    });

    prompt
        .run()
        .then(answer => {
            switch (answer) {

                case create:
                    CREATE_REPOSITORY();
                    break;

                case edit:
                    EDIT_REPOSITORY().then().catch(console.log);
                    break;

                case settings:
                    SETTINGS();
                    break;

                case exit:
                default:
                    clear();
                    handler.exitCLI();
                    break;
            }
        })
        .catch(console.log);
}

