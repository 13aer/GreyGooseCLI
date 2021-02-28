module.exports = function () {
    clear();
    askRepositoryName();
}

// MODELS
const Readme = require('../../../data/structure/models/Readme')
const Termin = require('../../../data/structure/models/Termin')
const TeamRepo = require('../../../data/structure/models/TeamRepo')
const Structure = require('../../../data/structure/Structure')

// ENQUIRER & INQUIRER
const {prompt} = require('enquirer');
const {Confirm} = require('enquirer');
const {Input} = require('enquirer');
const {Select} = require('enquirer');

// UTILS
const collector = require('../../../data/interface')
const writer = require('../../utils/readme-writer');
const validator = require('../../utils/validator')
const handler = require('../../utils/handler')
require('../../utils/globals')

// FORMATTING
const clear = require('clear');

// DATA
const main = require('../main')
let readme = new Readme("", "", true, true, true, true, "", "", [], [])
let appointments = [];
let header;
let year = new Date().getFullYear();


/**
 * @name askRepositoryName()
 * @description Menu to get the repository name
 */
function askRepositoryName() {
    let prompt = new Input({
        message: NOTE('Mit Enter werden die Default Werte (Placeholder) übernommen\n') + ERROR('Geben Sie "exit" ein um zum Hauptmenü zurückzukehren.\n\n') + HIGHLIGHT('Geben Sie einen Namen für das Repository ein: '),
        name: 'name',
        initial: 'Practical Exam Summer Semester ' + year,
        validate: async (input) => {
            return validator.name(input)
        }
    });
    prompt
        .run()
        .then(input => {

            if (input === 'exit') {
                main();
            } else {
                console.log('\n')
                confirmRepositoryName(input)
            }
        })
        .catch(console.log);

    /**
     * @name confirmRepositoryName()
     * @description Menu to confirm the repository name
     * @param name
     */
    function confirmRepositoryName(name) {
        let prompt = new Confirm({
            name: 'confirmName',
            message: HIGHLIGHT('Bitte bestätigen Sie den Namen: ') + WARNING(name) + "\n" + NOTE('Danach folgt die Erstellung der README\n')
        });
        prompt
            .run()
            .then(input => {
                clear()
                if (input) {
                    readme.repoName = name
                    header = WARNING(name) + ' '
                    askVariableContentInformation().then().catch(console.log);
                } else {
                    askRepositoryName();
                }
            })
            .catch(console.log);
    }
}

/**
 * @name askVariableContentInformation()
 * @description Menu to get Information about variable content of the README
 * @description Variable Content contains: abgabe, dokumentation, praesentation, commithistory, kolloquium, veroeffentlichungNote
 * @returns {Promise<void>}
 */
async function askVariableContentInformation() {
    let subheader = HIGHLIGHT('README: Abgabe und Anforderungen\n')
    console.log(header+subheader);

    await prompt([
        {
            type: 'input',
            name: 'abgabe',
            message: HIGHLIGHT('Frage [1/6]\t') + 'Wann erfolgt die Abgabe der Ergebnisse? ' + NOTE('[DD.MM.YYYY HH.MM]'),
            initial: '18.07.' + year + ' 18.00',
            validate: async (input) => {
                return validator.datetime(input)
            },
            format(value) {
                return value.replace(/[^\d. ]/g, '')
            }
        },
        {
            type: 'confirm',
            name: 'dokumentation',
            message: HIGHLIGHT('Frage [2/6]\t') + 'Soll eine Dokumentation erstellt werden?',
            initial: false
        },
        {
            type: 'confirm',
            name: 'praesentation',
            message: HIGHLIGHT('Frage [3/6]\t') + 'Soll eine Präsentation erstellt werden?',
            initial: false
        },
        {
            type: 'confirm',
            name: 'commithistory',
            message: HIGHLIGHT('Frage [4/6]\t') + 'Wird die Commit-Historie bewertet?',
            initial: false
        },
        {
            type: 'confirm',
            name: 'kolloquium',
            message: HIGHLIGHT('Frage [5/6]\t') + 'Findet ein verpflichtendes Kolloquium statt?',
            initial: true
        },
        {
            type: 'input',
            name: 'veroeffentlichungNote',
            message: HIGHLIGHT('Frage [6/6]\t') + 'Wann erfolgt die (voraussichtliche) Veröffentlichung der Endnote? ' + NOTE('... gegen '),
            initial: 'Ende August bzw. Anfang September 2021'
        }
    ])
        .then(input => {
            readme.abgabe = input.abgabe;
            readme.dokumentation = input.dokumentation;
            readme.praesentation = input.praesentation;
            readme.commithistory = input.commithistory;
            readme.kolloquium = input.kolloquium;
            readme.veroeffentlichungNote = input.veroeffentlichungNote;
            askFixedAppointments();
        })
        .catch(console.log);
}

/**
 * @name askFixedAppointments()
 * @description Menu to get Date of fixed Appointments
 * @description Fixed Appointments:
 * @description **Veröffentlichung der Rahmenbedingungen und Prüfungsthemen**
 * @description **Letzter Tag zur Prüfungsanmeldung**
 * @description **Zulosung der Aufgaben zu den Studierenden**
 * @returns {Promise<void>}
 */
async function askFixedAppointments() {
    clear();
    let subheader = HIGHLIGHT('README: Termine')
    let msg = 'Passen Sie das Datum für folgende drei Termine an\n' + NOTE('Ein leeres Datum wird mit TBD initialisiert. Sie können es später anpassen.\n')
    console.log(header + subheader + '\n\n' + msg)

    const initialDate = '01.01.2021'
    await prompt([
        {
            type: 'input',
            name: 'veroeffentlichung',
            message: HIGHLIGHT('Termin [1/3]\t') + 'Veröffentlichung der Rahmenbedingungen und Prüfungsthemen',
            initial: initialDate,
            validate: async (input) => {
                return validator.date(input)
            },
            format(value) {
                return value.replace(/[^\d.]/g, '')
            }

        },
        {
            type: 'input',
            name: 'anmeldung',
            message: HIGHLIGHT('Termin [2/3]\t') + 'Letzter Tag zur Prüfungsanmeldung',
            initial: initialDate,

            validate: async (input) => {
                return validator.date(input)
            },
            format(value) {
                return value.replace(/[^\d.]/g, '')
            }
        },
        {
            type: 'input',
            name: 'zulosung',
            message: HIGHLIGHT('Termin [3/3]\t') + 'Zulosung der Aufgaben zu den Studierenden',
            initial: initialDate,
            validate: async (input) => {
                return validator.date(input)
            },
            format(value) {
                return value.replace(/[^\d.]/g, '')
            }
        }
    ])
        .then(input => {

            appointments.push(new Termin('Veröffentlichung der Rahmenbedingungen und Prüfungsthemen', handler.parseDate(input.veroeffentlichung)));
            appointments.push(new Termin('Letzter Tag zur Prüfungsanmeldung', handler.parseDate(input.anmeldung)));
            appointments.push(new Termin('Zulosung der Aufgaben zu den Studierenden', handler.parseDate(input.zulosung)));
            let date = readme.abgabe.split(' ');
            appointments.push(new Termin('Einfrieren der Repositories um ' + date[1] + ' Uhr', handler.parseDate(date[0])));

            clear()
            askOtherAppointments();
        })
        .catch(console.log);
}

/**
 * @name askOtherAppointments()
 * @description Menu to get other appointments
 * @example Möglichkeit zur Klärung von Fragen zwischen 09.00 und 13.00 Uhr
 */
function askOtherAppointments() {

    let subheader = HIGHLIGHT('README: Weitere Termine\n')
    console.log(header + subheader)

    let question = 'Wollen Sie weitere Termine hinzufügen?\n' + NOTE(' Zum Beispiel:\n')
        + NOTE(' → Möglichkeit zur Klärung von Fragen zwischen 15 Uhr und 19 Uhr\n')
        + NOTE(' → Kolloquium (15 Minuten pro Thema im Zeitraum 20.07.2020 bis 08.08.2020)\n\n')

    const prompt = new Confirm({
        name: 'question',
        message: question,
        initial: false
    });
    prompt
        .run()
        .then(input => {
            input ? addAppointments() : reviewContent();
        })
        .catch(console.log);


}

/**
 * @name addAppointments()
 * @description Menu to add further appointments to Readme
 * @returns {Promise<void>}
 */
async function addAppointments() {
    clear();
    let subheader = HIGHLIGHT('README: Weitere Termine\n')
    console.log(header + subheader)

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
            }
        }
    ])
        .then(result => {
            let datum = (!result.datum.length || result.datum === 'TBD') ? 'TBD' : handler.parseDate(result.datum)
            appointments.push(new Termin(result.name, datum));

            clear();
            handler.printBox(HIGHLIGHT(result.name + ' hinzugefügt'), 'magenta')
            askOtherAppointments();
        })
        .catch(console.log)

}

/**
 * @name reviewContent()
 * @description Menu to review and alter each of the earlier input Readme contents
 */
function reviewContent() {
    clear();
    let subheader = HIGHLIGHT('README: Inhalte überprüfen\n')
    console.log(header + subheader)

    // creating choices
    let selectSubmission = 'Abgabe' + '\t\t\t\t' + NOTE(readme.abgabe)
    let selectDocumentation = 'Dokumentation' + '\t\t\t\t' + NOTE(readme.dokumentation)
    let selectPresentation = 'Präsentation' + '\t\t\t\t' + NOTE(readme.praesentation)
    let selectCommitHistory = 'Commit-History' + '\t\t\t' + NOTE(readme.commithistory)
    let selectColloquium = 'Kolloquium' + '\t\t\t\t' + NOTE(readme.kolloquium)
    let selectFinalGrade = 'Veröffentlichung der Endnote' + '\t\t' + NOTE(readme.veroeffentlichungNote) + '\n'
    let saveAll = INFO('Repository für Examen erstellen')
    let back2main = ERROR('Abbrechen (Zurück zum Hauptmenü)\tAchtung: Alle Änderungen werden verworfen.')

    let selection = [selectSubmission, selectDocumentation, selectPresentation, selectCommitHistory, selectColloquium, selectFinalGrade, saveAll, back2main];

    let prompt = new Select({
        message: 'Überprüfen Sie alle Eingaben',
        name: 'content',
        choices: selection
    });

    prompt
        .run()
        .then(input => {
            clear()
            console.log(header + subheader)
            switch (input) {
                case selectSubmission:
                    editSubmission()
                    break;
                case selectDocumentation:
                    editDocumentation()
                    break;
                case selectPresentation:
                    editPresentation()
                    break;
                case selectCommitHistory:
                    editCommithistory()
                    break;
                case selectColloquium:
                    editColloquium()
                    break;
                case selectFinalGrade:
                    editFinalGrade()
                    break;
                case saveAll:
                    confirmAll()
                    break;
                case back2main:
                    const main = require('../main')
                    main()
                    break;
            }
        })
        .catch(console.log);

    function editSubmission() {
        const prompt = new Input({
            name: 'abgabe',
            message: 'Wann erfolgt die Abgabe der Ergebnisse? ' + NOTE('[DD.MM.YYYY HH.MM]'),
            initial: readme.abgabe,
            validate: async (input) => {
                return validator.datetime(input)
            }
        });

        prompt
            .run()
            .then(input => {
                readme.abgabe = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }

    function editDocumentation() {
        const prompt = new Confirm({
            name: 'dokumentation',
            message: 'Soll eine Dokumentation erstellt werden?',
            initial: readme.dokumentation
        });

        prompt
            .run()
            .then(input => {
                readme.dokumentation = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }

    function editPresentation() {
        const prompt = new Confirm({
            name: 'praesentation',
            message: 'Soll eine Präsentation erstellt werden?',
            initial: readme.praesentation
        });

        prompt
            .run()
            .then(input => {
                readme.praesentation = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }

    function editCommithistory() {
        const prompt = new Confirm({
            name: 'commithistory',
            message: 'Wird die Commit-Historie bewertet?',
            initial: readme.commithistory
        });

        prompt
            .run()
            .then(input => {
                readme.commithistory = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }

    function editColloquium() {
        const prompt = new Confirm({
            name: 'kolloquium',
            message: 'Findet ein verpflichtendes Kolloquium statt?',
            initial: readme.kolloquium
        });

        prompt
            .run()
            .then(input => {
                readme.kolloquium = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }

    function editFinalGrade() {
        const prompt = new Input({
            name: 'veroeffentlichungNote',
            message: 'Wann erfolgt die (voraussichtliche) Veröffentlichung der Endnote? ' + NOTE('... gegen '),
            initial: readme.veroeffentlichungNote
        });

        prompt
            .run()
            .then(input => {
                readme.veroeffentlichungNote = input;
                clear();
                reviewContent()
            })
            .catch(console.log);
    }
}

/**
 * @name confirmAll()
 * @description Menu to confirm creating the Repository
 */
function confirmAll() {
    clear();
    let question = HIGHLIGHT('Repository jetzt erstellen:\n\n')
        + INFO(readme.repoName)

    let prompt = new Confirm({
        name: 'question',
        message: question
    });
    prompt
        .run()
        .then(input => {
            input ? createRepository(readme.repoName) : reviewContent();
        })
        .catch(console.log);
}

/**
 * @name createRepository()
 * @description This will create the final Repository and push the created README as only file
 */
async function createRepository(name) {
    readme.repoName = name;
    readme.themen = [];
    readme.termine = appointments;
    readme.muendlichePruefungen = ''

    let content = writer.getReadmeContent(readme, []);

    const spinner = handler.getSpinner('Repository wird erstellt...').start();
    await collector
        .createExam(readme.repoName, content)
        .then(msg => {
            console.log(msg)
            spinner.stop();
            if (msg === -1) {
                handler.printBox(ERROR('Repository ' + readme.repoName + ' konnte nicht erstellt werden, da es bereits existiert. '), 'red');
                newName();
            } else {
                // Daten für neues Repository als Structure Objekt speichern:
                let structure = new Structure(writer.getSlug(readme.repoName), new TeamRepo(-1, -1), readme, [], [])
                collector.saveStructureObject(structure)
                handler.printBox(INFO('Repository ' + readme.repoName + ' erstellt'), 'green')
                main();
            }
        })
        .catch(console.log);
}

/**
 * @name newName()
 * @description prompt to give the repository a new name
 * @description function will only be called if the used name is an already existing repository on the remote
 */
function newName() {

    let prompt = new Input({
        message: HIGHLIGHT('Geben Sie einen anderen Namen für das Repository ein: '),
        name: 'name',
        validate: async (input) => {
            return validator.name(input)
        }
    });
    prompt
        .run()
        .then(input => {
            createRepository(input).then().catch(console.log);
        })
        .catch(console.log);

}

