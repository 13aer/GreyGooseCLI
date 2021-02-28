module.exports = {
    run: function (slug) {
        initialize(collector.getStructureObject(slug));
    }
}

// MODELS
const Termin = require('../../../data/structure/models/Termin');
const {Choice} = require("../../../data/converter/models");

// ENQUIRER & INQUIRER
const inquirer = require('inquirer');
const {prompt} = require('enquirer');
const {Select} = require('enquirer');
const {Confirm} = require('enquirer');

// UTILS
const collector = require('../../../data/interface');
const handler = require('../../utils/handler');
const converter = require('../../utils/converter');
const validator = require('../../utils/validator');
require('../../utils/globals');

// FORMATTING
const clear = require('clear');
const dateformat = require('dateformat');

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
 * @example     add, delete, edit **appointments**
 */
function runSelection() {

    let add = 'Termine hinzufügen'
    let edit = 'Termine anpassen'
    let del = 'Termine löschen\n'
    let selection = [add, edit, del, back, exit];

    const prompt = new Select({
        name: 'termineSelect',
        message: 'Was möchten Sie machen?',
        choices: selection
    });

    prompt
        .run()
        .then((answer) => {
            handler.printNameClear(name);
            switch (answer) {
                case add:
                    addAppts().then().catch(console.log);
                    break
                case edit:
                    editAppts();
                    break
                case del:
                    deleteAppts();
                    break
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
 * @name addAppts()
 * @description prompt to insert a new **appointment**
 */
async function addAppts() {
    await prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Termin Beschreibung',
            validate(value) {
                if (!value.trim()) {
                    return "Ein Termin braucht einen Namen."
                } else return true;
            }
        },
        {
            type: 'input',
            name: 'datum',
            message: 'Datum',
            validate: async (input) => {
                return validator.date(input)
            },
            format(value) {
                return value.replace(/[^\d.]/g, '')
            }
        }
    ])
        .then(result => {

            // formate date
            if (!result.datum.trim()) result.datum = 'TBD'
            if (result.datum !== 'TBD') result.datum = handler.parseDate(result.datum);

            // update structure
            termine.push(new Termin(result.name, result.datum))
            structure.readme.termine = termine;
            collector.saveStructureObject(structure);

            // return prompt
            handler.printNameClear(name);
            handler.printBox(INFO(' ' + result.name + ' am ' + dateformat(result.datum, 'dd.mm.yyyy') + ' hinzugefügt '), 'green')
            runSelection();

        })
        .catch(console.log)
}

/**
 * @name deleteAppts()
 * @description prompt to delete an **appointment**
 * @description The appointment has to be selected first
 * @description After selecting an appointment the user is asked to confirm the delete
 */
function deleteAppts() {
    // convert appts to choice objects
    let selection = converter.getAppointmentsChoices(termine);
    selection.push(new Choice(back, null))

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'termin',
                message: 'Welchen Termin möchten Sie löschen?',
                choices: selection
            }
        )
        .then(answer => {
            if (answer.termin === null) {
                handler.printNameClear(name);
                runSelection();
            } else {
                confirmDeleteTermin(answer.termin);
            }
        })
        .catch(console.log)

    /**
     * @name confirmDeleteTermin()
     * @description prompt to confirm the delete of the appointment
     * @param appt  appointment to be deleted
     */
    function confirmDeleteTermin(appt) {
        const prompt = new Confirm({
            name: 'name',
            message: IMPORTANT(converter.printAppointment(appt) + ' wirklich löschen?'),
            initial: false
        });

        prompt
            .run()
            .then((answer) => {
                handler.printNameClear(name);
                if (answer) {
                    // update structure
                    structure.readme.termine = termine = handler.deleteItem(termine, appt);
                    collector.saveStructureObject(structure)
                    handler.printBox(ERROR(' ' + converter.printAppointment(appt) + ' gelöscht '), 'red')
                }
                runSelection();
            })
            .catch(console.log)
    }
}

/**
 * @name editAppts()
 * @description prompt to edit an **appointment**
 * @description The appointment has to be selected first
 */
function editAppts() {
    // convert appts to choice objects
    let selection = converter.getAppointmentsChoices(termine);
    selection.push(new Choice(back, null))

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'termin',
                message: 'Welchen Termin möchten Sie bearbeiten?',
                choices: selection
            }
        )
        .then(answer => {
            if (answer.termin === null) {
                handler.printNameClear(name);
                runSelection();
            } else {
                editAppt(answer.termin).then().catch(console.log);
            }
        })
        .catch(console.log);

    /**
     * @name editAppt()
     * @description     prompt to alter the description and date of an existing appointment
     * @param appt      appointment to be edited
     */
    async function editAppt(appt) {
        // format date
        let date = (appt.datum === 'TBD') ? appt.datum : dateformat(appt.datum, 'dd.mm.yyyy')

        await prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Termin Beschreibung',
                initial: appt.beschreibung,
                validate(value) {
                    if (!value.trim()) {
                        return "Ein Termin braucht einen Namen."
                    } else return true;
                }
            },
            {
                type: 'input',
                name: 'datum',
                message: 'Datum',
                initial: date,
                validate: async (input) => {
                    return validator.date(input)
                },
                format(value) {
                    return value.replace(/[^\d.]/g, '')
                }
            }
        ])
            .then(result => {
                handler.printNameClear(name);

                // format date
                if (!result.datum.trim()) result.datum = 'TBD'
                if (result.datum !== 'TBD') result.datum = handler.parseDate(result.datum);

                // save structure
                appt.datum = result.datum
                appt.beschreibung = result.name
                structure.readme.termine = termine
                collector.saveStructureObject(structure)

                // return prompt
                handler.printBox(HIGHLIGHT(result.name + ' am ' + dateformat(appt.datum, 'dd.mm.yyyy') + ' angepasst'), 'magenta')
                runSelection();
            })
            .catch(console.log);
    }
}
