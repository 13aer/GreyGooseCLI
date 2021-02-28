module.exports = async function () {
    clear();
    const apiGet = require('../../../data/interface');
    const handler = require('../../utils/handler')
    const spinner = handler.getSpinner('Repositories werden geladen...').start();
    await apiGet
        .getAllRepositoriesWithSaveFile()
        .then(result => {
            spinner.stop();
            selection = result;
            runPrompt(result);
        })
        .catch(console.log);
}
// REQUIRED
const {Choice} = require("../../../data/converter/models");
const inquirer = require('inquirer');
const clear = require('clear');
require('../../utils/globals')
const main = require('../main');
const edit = require('./select');
let selection;
let back2main = HIGHLIGHT('Zurück zum Hauptmenü')


/**
 * @name runPrompt()
 * @description         prompt to select a repository to be forwarded to the edit section
 * @param selection     Selection of Exam-Repositorys created by the PEG CLI
 */
function runPrompt(selection) {
    selection.push(new Choice(back2main, null));

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'repo',
                message: 'Wählen Sie ein Repository zum Bearbeiten aus:\n  ' + NOTE('ID') + '\t' + NOTE('NAME'),
                choices: selection
            }
        )
        .then(input => {
            if (input.repo === null) {
                clear();
                main();
            } else {
                edit.run(input.repo.slug);
            }
        })
        .catch(console.log);
}

