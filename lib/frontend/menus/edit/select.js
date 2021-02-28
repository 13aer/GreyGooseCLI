const collector = require('../../../data/interface')
module.exports = {
    run: function (slug) {
        initialize(collector.getStructureObject(slug));
    }
}

// MODELS
const Termin = require('../../../data/structure/models/Termin')

// ENQUIRER & INQUIRER
const {Select} = require('enquirer');
const {Input} = require('enquirer');
const {Confirm} = require('enquirer');

// UTILS
const handler = require('../../utils/handler')
const writer = require('../../utils/readme-writer')
require('../../utils/globals')

// FORMATTING
const clear = require('clear');
const dateformat = require('dateformat');

// PROMPTS
const apptsMenu = require('./appointments')
const topicsMenu = require('./topics')
const contentMenu = require('./content')
const teamsMenu = require('./teams')
const main = require('../main')


// STRUCTURE
let structure;
let teamRepo;
let name;
let slug;
let termine;
let themen;
let teams;
let studenten;

/**
 * @name initialize()
 * @description     Function to initialize the structure variables for easier usage in the prompts
 * @description     Appointments have to be casted to actual Termin-Objects
 * @description     Instead of structure.readme.termine the termine variable can be used for easier access
 * @param struct    structure, file which is saved in the temp folder
 */
function initialize(struct) {
    updateStructure(struct);
    handler.printNameClear(name);
    runSelection();
}
/**
 * @name update()
 * @description     Function to update the Structure Object
 * @param struct    structure object which contains the updated values
 */
function updateStructure(struct) {
    structure = struct
    teamRepo = struct.teamRepo
    name = struct.readme.repoName
    slug = struct.slug
    themen = struct.readme.themen
    teams = struct.teams
    studenten = struct.studenten

    termine = [];
    /**
     * Termine have to be casted to actual Termin-Objects as they are generic objects right now
     */
    for (let obj of struct.readme.termine) termine.push(new Termin(obj.beschreibung, obj.datum));
}

/**
 * @name runSelection()
 * @description prompt to select what the user wants to do next
 */
function runSelection() {
    let save = INFO('Neue Readme pushen') + '\t\t' + INFO('Alle Änderungen speichern und README pushen')
    let back = HIGHLIGHT('Zurück zum Hauptmenü')
    let exit = ERROR('Exit')
    let contentSelect = 'README-Inhalte' + '\t\tVariablen Readme Content anpassen\n'
    let termineSelect = 'Termine' + '\t\t\tTermine anpassen, hinzufügen oder löschen'
    let themenSelect = 'Themen' + '\t\t\tPrüfungsthemen anpassen, hinzufügen oder löschen'
    let teamsSelect = 'Teams' + '\t\t\t\tTeams erstellen und verwalten'

    let selection = [teamsSelect, themenSelect, termineSelect, contentSelect, save, back, exit]

    const prompt = new Select({name: 'editSelection', message: 'Was möchten Sie bearbeiten?', choices: selection});

    prompt
        .run()
        .then((selection) => {

            handler.printNameClear(name);
            switch (selection) {

                case contentSelect:
                    contentMenu.run(slug);
                    break;

                case termineSelect:
                    apptsMenu.run(slug);
                    break;

                case themenSelect:
                    topicsMenu.run(slug);
                    break;

                case teamsSelect:
                    teamsMenu.run(slug);
                    break;

                case save:
                    publishTeamsConfirm();
                    break;

                case back:
                    main();
                    break;

                default:
                    clear();
                    handler.exitCLI();
                    break;
            }
        })
        .catch(console.log);


}

/**
 * @name publishTeamsConfirm()
 * @description prompt is being opened when user select save new readme
 * @description The user has to confirm to publish the teams in the readme
 * @description If the user doesnt confirm, the readme will contain the initial placeholder teams table
 */
function publishTeamsConfirm() {
    let date = dateformat(termine.find(t => t.beschreibung === 'Zulosung der Aufgaben zu den Studierenden').datum, 'dd.mm.yyyy')

    const prompt = new Confirm({
        name: 'confirm',
        message: 'Möchten Sie die Teams in der README veröffentlichen?\n' + NOTE('  Das offizielle Datum der "Zulosung der Aufgaben zu den Studierenden" ist der ') + HIGHLIGHT(date) + '\n\n'
    });

    prompt
        .run()
        .then(answer => {
            getCommitMsg(answer);
        })
        .catch(console.log);
}

/**
 * @name getCommitMsg()
 * @description         prompt is asking the user for the commit msg when pushing the updated new readme
 * @default             updated readme contents
 * @param publishTeams  boolean whether teams should be published or not
 */
function getCommitMsg(publishTeams) {
    const prompt = new Input({
        message: 'Bitte geben Sie eine Commit Nachricht an:',
        initial: 'updated readme contents'
    });

    prompt
        .run()
        .then(answer => {
            clear();
            createNewReadme(answer, publishTeams)
                .then(() => {
                })
                .catch(console.log);
        })
        .catch(console.log);
}

/**
 * @name createNewReadme
 * @description             function to push the new readme
 * @param commitMsg         String: commit message of getCommitMsg prompt
 * @param publishTeams      Boolean: of publishTeamsConfirm prompt
 */
async function createNewReadme(commitMsg, publishTeams) {

    updateStructure(collector.getStructureObject(slug));
    let content = (publishTeams) ? writer.getReadmeContent(structure.readme, teams) : writer.getReadmeContent(structure.readme, []);
    const spinner = handler.getSpinner('Readme wird gepusht...').start();
    await collector
        .pushNewReadme(slug, content, commitMsg)
        .then(() => {
            spinner.stop();
            handler.printBox(INFO(' Neue Readme für ' + name + ' gepusht. '), 'green');
            runSelection();
        })
        .catch(console.log);
}


