const collector = require('../../../data/interface');
module.exports = {
    run: function (slug) {
        initialize(collector.getStructureObject(slug));
    }
}

// MODELS
const Termin = require('../../../data/structure/models/Termin');
const Thema = require('../../../data/structure/models/Thema');
const {Choice} = require("../../../data/converter/models");

// ENQUIRER & INQUIRER
const inquirer = require('inquirer');
const {prompt} = require('enquirer');
const {Select} = require('enquirer');
const {Confirm} = require('enquirer');

// UTILS
const handler = require('../../utils/handler');
const converter = require('../../utils/converter');
const validator = require('../../utils/validator');
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
    update(struct)
    handler.printNameClear(name)
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
    let add = 'Themen hinzufügen'
    let edit = 'Themen anpassen'
    let del = 'Themen löschen\n'
    let selection = [add, edit, del, back, exit];

    const prompt = new Select({
        name: 'themenSelect',
        message: 'Was möchten Sie machen?',
        choices: selection
    });
    prompt
        .run()
        .then((answer) => {
            handler.printNameClear(name);
            switch (answer) {

                case add:
                    addTopics().then().catch(console.log);
                    break;

                case edit:
                    if (themen.length === 0) {
                        // case: not topics exist
                        handler.printBox(ERROR(' Es gibt noch keine Themen zum bearbeiten.\n Fügen Sie stattdessen ein neues Thema hinzu. '), 'red')
                        runSelection();
                    } else {
                        editTopics();
                    }
                    break;

                case del:
                    let themenWithoutTeam = handler.getFreeTopics();
                    if (themen.length === 0) {
                        // case: not topics exist
                        handler.printBox(ERROR(' Es gibt noch keine Themen zum löschen.\n Fügen Sie stattdessen ein neues Thema hinzu. '), 'red');
                        runSelection();
                    } else if (themenWithoutTeam.length === 0) {
                        // case: all topics are linked to a full team
                        handler.printBox(ERROR(' Allen Themen ist ein Team zugewiesen.\n Themen mit Teams können nicht gelöscht werden. '), 'red');
                        runSelection();
                    } else {
                        deleteTopics();
                    }
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
        .catch(console.log)
}

/**
 * @name addTopics()
 * @description Prompt to create a **new topic**
 * @requires    a topic needs a name, a scope between 1 & 2 and a description
 */
async function addTopics() {
    await prompt([
        {
            type: 'input',
            name: 'thema',
            message: 'Thema',
            validate(value) {
                if (!value.trim()) {
                    return "Ein Thema braucht einen Namen."
                } else return true;
            }
        },
        {
            type: 'input',
            name: 'umfang',
            message: 'Umfang',
            initial: 1,
            validate: async (input) => {
                return validator.scope(input)
            }
        },
        {
            type: 'input',
            name: 'beschreibung',
            message: 'Beschreibung',
            validate(value) {
                if (!value.trim()) {
                    return "Ein Thema braucht eine Beschreibung."
                } else return true;
            }
        }
    ])
        .then(result => {

            // format umfang
            if (!result.umfang.trim()) result.umfang = 1;

            // create unique ID
            let id = handler.getIncId(themen)

            // create new topic
            themen.push(new Thema(id, result.thema, Number(result.umfang), result.beschreibung, -1))

            // update structure
            structure.readme.themen = themen
            collector.saveStructureObject(structure)

            handler.printNameClear(name)
            handler.printBox(INFO(' ' + result.thema + ' hinzugefügt '), 'green')
            runSelection();
        })
        .catch(console.log)
}

/**
 * @name deleteTopics()
 * @description Prompt to delete an existing topic
 */
function deleteTopics() {
    // get all topics without a team and convert them to choice objects
    let themenWithoutTeam = handler.getFreeTopics()
    let selection = converter.getTopicsChoices(themenWithoutTeam)
    selection.push(new Choice(back, null))

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'thema',
                message: 'Welches Thema möchten Sie löschen?',
                choices: selection
            }
        )
        .then(answer => {
            if (answer.thema === null) {
                // back
                handler.printNameClear(name);
                runSelection();
            } else {
                confirmDeleteTopic(answer.thema)
            }
        })
        .catch(console.log)

    /**
     * @name confirmDeleteTopic()
     * @description Prompt to confirm the deletion of this topic
     * @param topic topic to be deleted
     */
    function confirmDeleteTopic(topic) {
        const prompt = new Confirm({
            name: 'name',
            message: IMPORTANT(topic.thema + ' wirklich löschen?'),
            initial: false
        });
        prompt
            .run()
            .then(answer => {
                handler.printNameClear(name)
                if (answer) {
                    // update structure
                    structure.readme.themen = themen = handler.deleteItem(themen, topic)
                    collector.saveStructureObject(structure)
                    handler.printBox(ERROR(' ' + topic.thema + ' gelöscht '), 'red')
                }
                runSelection();
            })
            .catch(console.log)
    }
}

/**
 * @name editTopics()
 * @description prompt to edit an existing topic
 * @description the topic needs to be selected first
 */
function editTopics() {
    let selection = converter.getTopicsChoices(themen)
    selection.push(new Choice(back, null))

    inquirer.prompt(
        {
            type: 'list',
            name: 'thema',
            message: 'Welches Thema möchten Sie bearbeiten?' + NOTE('\n  ID\tUmfang\tThema'),
            choices: selection
        }
    )
        .then(answer => {
            if (answer.thema === null) {
                handler.printNameClear(name);
                runSelection();
            } else {
                editTopic(answer.thema).then().catch(console.log);
            }
        })
        .catch(console.log)

    /**
     * @name editTopic()
     * @description prompt to insert the new values of the topic
     * @param topic topic to be altered
     */
    async function editTopic(topic) {
        await prompt([
            {
                type: 'input',
                name: 'thema',
                message: 'Thema',
                initial: topic.thema,
                validate(value) {
                    if (!value.trim()) {
                        return "Ein Thema braucht einen Namen."
                    } else return true;
                }
            },
            {
                type: 'input',
                name: 'umfang',
                message: 'Umfang',
                initial: topic.umfang,
                validate: async (input) => {
                    return validator.scope(input)
                }
            },
            {
                type: 'input',
                name: 'beschreibung',
                message: 'Beschreibung',
                initial: topic.beschreibung,
                validate(value) {
                    if (!value.trim()) {
                        return "Ein Thema braucht eine Beschreibung."
                    } else return true;
                }
            }
        ])
            .then(alteredTopic => {
                // saved edited topic
                topic.thema = alteredTopic.thema
                topic.umfang = alteredTopic.umfang
                topic.beschreibung = alteredTopic.beschreibung

                // update structure
                structure.readme.themen = themen
                collector.saveStructureObject(structure)

                handler.printNameClear(name)
                handler.printBox(HIGHLIGHT(' ' + alteredTopic.thema + ' angepasst '), 'magenta')
                runSelection();
            })
            .catch(console.log)
    }
}