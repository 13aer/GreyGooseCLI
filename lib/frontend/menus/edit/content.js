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
const handler = require('../../utils/handler');
const validator = require('../../utils/validator');
const collector = require('../../../data/interface');
require('../../utils/globals');

// FORMATTING
const clear = require('clear');

// DATA
const back = HIGHLIGHT('Zurück');
const exit = ERROR('Exit');
const editMenu = require('./select');

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
    update(struct);
    handler.printNameClear(name);
    runSelection();
}

/**
 * @name update()
 * @description     Function to update the Structure Object
 * @param struct    structure object which contains the updated values
 */
function update(struct) {
    structure = struct
    teamRepo = struct.teamRepo
    name = struct.readme.repoName
    slug = struct.slug
    themen = struct.readme.themen
    teams = struct.teams
    studenten = struct.studenten

    termine = [];
    // cast termine to TerminObjects (Generic Objects right now)
    for (let obj of struct.readme.termine) {
        termine.push(new Termin(obj.beschreibung, obj.datum))
    }
}

/**
 * @name runSelection()
 * @description prompt to select what the user wants to do next
 */
function runSelection() {
    let selectSubmission = 'Abgabe/Schließen der Repositories' + '\t' + NOTE(structure.readme.abgabe)
    let selectDocumentation = 'Dokumentation' + '\t\t\t\t' + NOTE(structure.readme.dokumentation)
    let selectPresentation = 'Präsentation' + '\t\t\t\t' + NOTE(structure.readme.praesentation)
    let selectCommitHistory = 'Commit-History' + '\t\t\t' + NOTE(structure.readme.commithistory)
    let selectColloquium = 'Kolloquium' + '\t\t\t\t' + NOTE(structure.readme.kolloquium)
    let selectFinalGrade = 'Veröffentlichung der Endnote' + '\t\t' + NOTE(structure.readme.veroeffentlichungNote)
    let selectOralExams = 'Mündliche Prüfungen' + '\t\t\t' + NOTE(structure.readme.muendlichePruefungen) + '\n'
    let selection = [selectSubmission, selectDocumentation, selectPresentation, selectCommitHistory, selectColloquium, selectFinalGrade, selectOralExams, back, exit];

    let prompt = new Select({
        message: 'Welchen Inhalt möchten Sie bearbeiten?',
        name: 'content',
        choices: selection
    });

    prompt
        .run()
        .then((select) => {
            handler.printNameClear(name);
            switch (select) {
                case selectSubmission:
                    editSubmission();
                    break;
                case selectDocumentation:
                    editDocumentation();
                    break;
                case selectPresentation:
                    editPresentation();
                    break;
                case selectCommitHistory:
                    editCommitHistory();
                    break;
                case selectColloquium:
                    editColloquium();
                    break;
                case selectFinalGrade:
                    editFinalGrade();
                    break;
                case selectOralExams:
                    editOralExams();
                    break;
                case back:
                    editMenu.run(slug);
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

/**
 * @name editSubmission()
 * @description prompt to alter **Abgabe**
 */
function editSubmission() {
    const prompt = new Input({
        name: 'abgabe',
        message: 'Wann erfolgt die Abgabe der Ergebnisse? ' + NOTE('[DD.MM.YYYY HH.MM]'),
        initial: structure.readme.abgabe,
        validate: async (input) => {
            return validator.datetime(input)
        }
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.abgabe = answer;
            let date = answer.split(' ');
            structure.readme.termine.find(appt => appt.beschreibung.includes('Einfrieren der Repositories')).beschreibung = 'Einfrieren der Repositories um ' + date[1] + ' Uhr';
            structure.readme.termine.find(appt => appt.beschreibung.includes('Einfrieren der Repositories')).datum = handler.parseDate(date[0]);


            collector.saveStructureObject(structure);
            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}
/**
 * @name editDocumentation()
 * @description prompt to alter **Dokumentation**
 */
function editDocumentation() {
    const prompt = new Confirm({
        name: 'dokumentation',
        message: 'Soll eine Dokumentation erstellt werden?',
        initial: structure.readme.dokumentation
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.dokumentation = answer;
            collector.saveStructureObject(structure);
            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}

/**
 * @name editPresentation()
 * @description prompt to alter **Präsentation**
 */
function editPresentation() {
    const prompt = new Confirm({
        name: 'praesentation',
        message: 'Soll eine Präsentation erstellt werden?',
        initial: structure.readme.praesentation
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.praesentation = answer;
            collector.saveStructureObject(structure);

            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}

/**
 * @name editCommitHistory()
 * @description prompt to alter **Commit History**
 */
function editCommitHistory() {
    const prompt = new Confirm({
        name: 'commithistory',
        message: 'Wird die Commit-Historie bewertet?',
        initial: structure.readme.commithistory
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.commithistory = answer;
            collector.saveStructureObject(structure);

            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}

/**
 * @name editColloquium()
 * @description prompt to alter **Kolloquium**
 */
function editColloquium() {
    const prompt = new Confirm({
        name: 'kolloquium',
        message: 'Findet ein verpflichtendes Kolloquium statt?',
        initial: structure.readme.kolloquium
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.kolloquium = answer;
            collector.saveStructureObject(structure);

            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}

/**
 * @name editFinalGrade()
 * @description prompt to alter **Veröffentlichung der Endnote**
 */
function editFinalGrade() {
    const prompt = new Input({
        name: 'veroeffentlichungNote',
        message: 'Wann erfolgt die (voraussichtliche) Veröffentlichung der Endnote? ' + NOTE('... gegen '),
        initial: structure.readme.veroeffentlichungNote
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.veroeffentlichungNote = answer;
            collector.saveStructureObject(structure);

            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}

/**
 * @name editOralExams()
 * @description prompt to alter **mündliche Prüfungen**
 */
function editOralExams() {
    const prompt = new Input({
        name: 'pruefung',
        message: 'Wann finden die mündlichen Prüfungen statt? ' + NOTE('[DD.MM.YYYY HH.MM]'),
        initial: structure.readme.muendlichePruefungen,
        validate: async (input) => {
            return validator.datetime(input)
        },
        format(value) {
            return value.replace(/[^\d. ]/g, '')
        }
    });
    prompt
        .run()
        .then(answer => {
            structure.readme.muendlichePruefungen = answer;

            let date = answer.split(' ');
            termine.push(new Termin('Mündliche Prüfungen ab ' + date[1] + ' Uhr', handler.parseDate(date[0])));

            structure.readme.termine = termine;
            collector.saveStructureObject(structure);

            handler.printNameClear(name);
            runSelection();
        })
        .catch(console.log);
}