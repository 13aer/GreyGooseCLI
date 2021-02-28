const collector = require('../../../data/interface')
module.exports = {
    run: function (slug) {
        initialize(collector.getStructureObject(slug));
    }
}

// MODELS
const Termin = require('../../../data/structure/models/Termin')
const Team = require('../../../data/structure/models/Team');
const Student = require('../../../data/structure/models/Student');
const {Choice} = require("../../../data/converter/models");

// ENQUIRER & INQUIRER
const inquirer = require('inquirer');
const {prompt} = require('enquirer');
const {Select} = require('enquirer');
const {Input} = require('enquirer');
const {Confirm} = require('enquirer');

// UTILS
const handler = require('../../utils/handler')
const converter = require('../../utils/converter')
const validator = require('../../utils/validator')
const editMenu = require('./select')
require('../../utils/globals')

// FORMATTING
const clear = require('clear');

// DATA
const back = HIGHLIGHT('Zurück')
const exit = ERROR('Exit')

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

    let editViewTeams = 'Teams bearbeiten' + '\t\t\t' + NOTE('Hier können Sie die Teams einsehen und bearbeiten.')
    let addStudentSingle = 'Studenten hinzufügen:' + ' ' + INFO('Einzelteam') + '\t' + NOTE('Hier können Sie einen einzelnen Studenten zu einem Team hinzufügen.')
    let addStudentDouble = 'Studenten hinzufügen:' + ' ' + INFO('Zweierteam') + '\t' + NOTE('Hier können Sie zwei Studenten zu einem Team hinzufügen.\n')
    let createTeamRepos = IMPORTANT('Team Repositories erstellen') + '\t\t' + NOTE('Hier können Sie die Bitbucket-Team-Repositories erstellen.')
    let freezeTeamRepos = IMPORTANT('Team Repositories einfrieren') + '\t\t' + NOTE('Das offizielle Datum zum Einfrieren der Repos ist der ') + HIGHLIGHT(structure.readme.abgabe + ' Uhr')
    let cloneTeamRepos = IMPORTANT('Team Repositories klonen') + '\t\t' + NOTE('Hier können Sie die Bitbucket-Team-Repositories auf Ihren Rechner klonen.\n')


    let selection = [editViewTeams, addStudentSingle, addStudentDouble, createTeamRepos, freezeTeamRepos, cloneTeamRepos, back, exit];

    const prompt = new Select({
        name: 'select',
        message: 'Was möchten Sie machen?',
        choices: selection
    });

    prompt
        .run()
        .then((selection) => {

            handler.printNameClear(name);

            switch (selection) {

                case addStudentSingle:
                    if (collector.getAssignmentsWithNoTeams(1).length !== 0 || handler.hasMissingStudent(themen)) {
                        createSingleTeam().then(() => {
                        }).catch(console.log);
                    } else {
                        handler.printBox(ERROR(' Es gibt keine freien Themen mit dem Umfang 1 \n Fügen Sie weitere Themen hinzu '), 'red');
                        runSelection();
                    }
                    break;

                case addStudentDouble:
                    if (collector.getAssignmentsWithNoTeams(2).length !== 0) {
                        createDoubleTeam().then(() => {
                        }).catch(console.log);
                    } else {
                        handler.printBox(ERROR(' Es gibt keine freien Themen mit dem Umfang 2 \n Fügen Sie weitere Themen hinzu '), 'red');
                        runSelection();
                    }
                    break;

                case editViewTeams:
                    selectTeam();
                    break;

                case createTeamRepos:

                    if (structure.teams.length === 0) {
                        // if no teams exist we can't create repositories
                        handler.printBox(ERROR('Es existieren keine Teams, für die ein Repository erstellt werden könnte'), 'red');
                        runSelection();
                    } else if (Number(structure.teamRepo.name) === -1 && Number(structure.teamRepo.url) === -1) {
                        // if template for team repositories isn't set yet open prompt to get template name and template repository link
                        getTeamRepoTemplate().then().catch(console.log);
                    } else {
                        // create team repositories with existing template
                        createTeamRepositories().then().catch(console.log);
                    }
                    break;

                case cloneTeamRepos:
                    if (structure.teams.length === 0) {
                        // if no teams exist we can't clone repositories
                        handler.printBox(ERROR('Es existieren keine Teams, für die Repositories geklont werden könnten.'), 'red');
                        runSelection();
                    } else {
                        cloneRepos();
                    }
                    break;

                case freezeTeamRepos:
                    if (structure.teams.length === 0) {
                        // if no teams exist we can't clone repositories
                        handler.printBox(ERROR('Es existieren keine Teams und keine Repositories der eingefroren werden könnten.'), 'red');
                        runSelection();
                    } else {
                        freezeRepos();
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
        .catch(console.log);
}


/**
 * @name createSingleTeam()
 * @description Function/Prompt to add a single student to a team
 */
async function createSingleTeam() {
    // prompt to ask student details
    await prompt([
        {
            type: 'input',
            name: 'matrikel',
            message: 'Matrikelnummer',
            initial: '5100000',
            validate(input) {
                return validator.matrikel(input)
            }
        },
        {
            type: 'input',
            name: 'knummer',
            message: 'k-Nummer',
            initial: 'k12345',
            validate(input) {
                return validator.kNummer(input)
            }
        }
    ])
        .then(result => {
            let student = new Student(result.matrikel, result.knummer)
            // check if student exists
            if (handler.studentExists(student, structure.studenten)) {
                handler.printBox(ERROR('Student ist bereits einem Team zugewiesen.'), 'red');
                runSelection();
            } else {
                addStudent(student);
            }
        })

    /**
     * @name addStudent()
     * @description     creates a team with the new student and a free topic of scope 1 OR
     * @description     checks whether there is a team with a missing student and adds him it to the team
     * @param student   student to be added/created
     */
    async function addStudent(student) {
        handler.printNameClear(name);

        // find a free topic
        let freeTopic = handler.findTopic(themen, 1);

        // check if topic belong to a team with scope 2 but only one student
        let team = collector.getTeamForAssignment(freeTopic);
        if (team === -1) {

            // not team exists to this topic; create new team
            collector.createTeam(new Team(handler.getIncId(teams), -1, false, freeTopic.id, 'TBD', '??', [student.matrikelnummer]));

        } else {

            // a team exists; add student to this team with correct right if the team has a repository
            let spinner = handler.getSpinner('Student wird zum Team hinzugefügt...').start();
            await collector
                .addStudentToTeam(student, team)
                .then(msg => {
                    spinner.stop();

                    // print messages based on failed/successful api call
                    if (msg === 0) {
                        handler.printBox(HIGHLIGHT('Der Student wurde erfolgreich zum Team hinzugefügt.'), 'magenta');
                    } else if (msg === 1) {
                        handler.printBox(HIGHLIGHT('Der Student wurde erfolgreich zum Team hinzugefügt. \n Er hat ebenfalls Schreibrechte auf das verlinkte Repository erhalten.'), 'magenta')
                    } else if (msg === -1) {
                        handler.printBox(ERROR('Etwas ist schiefgelaufen. \n Der Student wurde nicht zum Team hinzugefügt.'), 'red');
                    }
                })
                .catch(console.log);
        }
        // update structure
        collector.createStudent(student);
        update(collector.getStructureObject(slug));
        runSelection();
    }
}

/**
 * @name createDoubleTeam()
 * @description Function/Prompt to add two students to a team / create a new team
 */
async function createDoubleTeam() {
    // prompt to ask student details
    await prompt([
        {
            type: 'input',
            name: 'matrikelA',
            message: IMPORTANT('Matrikelnummer Student A'),
            initial: '5100000',
            validate(input) {
                return validator.matrikel(input)
            }
        },
        {
            type: 'input',
            name: 'knummerA',
            message: IMPORTANT('k-Nummer Student A'),
            initial: 'k12345',
            validate(input) {
                return validator.kNummer(input)
            }
        },
        {
            type: 'input',
            name: 'matrikelB',
            message: HIGHLIGHT('Matrikelnummer Student B'),
            initial: '5100000',
            validate(input) {
                return validator.matrikel(input)
            }
        },
        {
            type: 'input',
            name: 'knummerB',
            message: HIGHLIGHT('k-Nummer Student B'),
            initial: 'k12345',
            validate(input) {
                return validator.kNummer(input)
            }
        }
    ])
        .then(inputStudents => {

            let studentA = new Student(inputStudents.matrikelA, inputStudents.knummerA);
            let studentB = new Student(inputStudents.matrikelB, inputStudents.knummerB);
            // check if any of the students already exists
            if (handler.studentExists(studentA, structure.studenten)) {
                // StudentA does already exist
                handler.printBox(ERROR('Student ' + studentA.matrikelnummer + ' existiert bereits.'), 'red')
                runSelection();
            } else if (handler.studentExists(studentB, structure.studenten)) {
                // StudentB does already exist
                handler.printBox(ERROR('Student ' + studentB.matrikelnummer + ' existiert bereits.'), 'red')
                runSelection();
            } else {
                addStudents(studentA, studentB);
            }
        })
        .catch(console.log);

    /**
     * @name addStudents()
     * @description     creates a team with the new students and a free topic of scope 2
     * @param studentA  first student to be added
     * @param studentB  second student to be added
     */
    function addStudents(studentA, studentB) {
        handler.printNameClear(name);

        // create the new student objects
        collector.createStudent(studentA);
        collector.createStudent(studentB);

        // find a free topic with scope 2
        let freeTopic = handler.findTopic(themen, 2)

        // create a new team
        collector.createTeam(new Team(handler.getIncId(teams), -1, false, freeTopic.id, 'TBD', '??', [studentA.matrikelnummer, studentB.matrikelnummer]))

        // save structure
        update(collector.getStructureObject(slug));
        handler.printBox(HIGHLIGHT('Team wurde erstellt.'), 'magenta');
        runSelection();
    }
}

/**
 * @name selectTeam()
 * @description Function to select a specific team out of the existing ones
 */
function selectTeam() {

    let selection = converter.getTeamsChoices(teams, themen)
    selection.push(new Choice(back, null));

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'team',
                message: 'Wählen Sie ein Team aus\n' + '  ' + HIGHLIGHT.underline('ID\tUmfang\t\t\tThema\t\t\t\t\tMatrikelnummern'),
                choices: selection
            }
        )
        .then(selectedTeam => {
            handler.printNameClear(name);
            (selectedTeam.team === null) ? runSelection() : editTeam(selectedTeam.team);
        })
        .catch(console.log);
}

/**
 * @name editTeam()
 * @description Function to alter the selected team
 * @param team  Team to be edited
 */
function editTeam(team) {

    let subStudentSelect = 'Student ' + ERROR('ersetzen')
    let removeStudentSelect = 'Student ' + ERROR('entfernen')
    let uhrzeitSelect = 'Mündliche Prüfung:\t' + INFO('Uhrzeit') + ' anpassen'
    let statusSelect = 'Mündliche Prüfung:\t' + INFO('Status') + ' anpassen\n'

    let topicOfTeam = themen.find(t => t.id === team.themaID);
    let newLine = '\n';
    let sep = ' | ';

    // prints out an info box with information about the selected team
    let teamInfoBox = BRIGHT('Team ' + converter.printID(team.id)) + newLine
        + HIGHLIGHT('Thema-ID: ' + converter.printID(topicOfTeam.id)) + sep
        + INFO('Thema: ' + topicOfTeam.thema) + sep
        + IMPORTANT('Uhrzeit: ' + team.uhrzeit) + sep
        + SUBNOTE('Status: ' + team.status) + newLine
        + NOTE('Studenten: ' + converter.printStudents(team.studenten));

    handler.printBox(teamInfoBox, 'magenta');

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'menu',
                message: 'Was wollen Sie machen?',
                choices: [subStudentSelect, removeStudentSelect, uhrzeitSelect, statusSelect, back, exit]

            }
        )
        .then(function (answer) {
            handler.printNameClear(name);
            switch (answer.menu) {

                case subStudentSelect:
                    selectStudentToSubstitute(team);
                    break;

                case removeStudentSelect:
                    selectStudentToRemove(team).then().catch(console.log);
                    break;

                case uhrzeitSelect:
                    editOralExamTime();
                    break;

                case statusSelect:
                    editOralExamStatus();
                    break;

                case back:
                    handler.printNameClear(name);
                    selectTeam();
                    break;

                case exit:
                default:
                    clear();
                    exitCLI();
            }
        })
        .catch(console.log);

    /**
     * @name editOralExamTime()
     * @description Function to alter the time of the oral exam of the selected team
     */
    function editOralExamTime() {

        const prompt = new Input({
            message: 'Um welche Uhrzeit findet die Prüfung statt?' + '\t' + NOTE('HH.MM'),
            initial: team.uhrzeit,
            validate: function (input) {
                return validator.time(input);
            }
        });
        prompt
            .run()
            .then(answer => {
                teams.find(t => t.id === team.id).uhrzeit = answer;
                collector.saveStructureObject(structure);
                handler.printNameClear(name);
                editTeam(team);
            })
            .catch(console.log);
    }

    /**
     * @name editOralExamStatus()
     * @description Function to alter the status of the oral exam of the selected team
     * @description status can be **??**, **Präsenz** or **Zoom**
     */
    function editOralExamStatus() {
        const prompt = new Select({
            name: 'status',
            message: 'Wählen Sie einen Status aus',
            choices: ['Präsenz', 'Zoom', '??']
        });
        prompt
            .run()
            .then(answer => {
                teams.find(t => t.id === team.id).status = answer;
                collector.saveStructureObject(structure);
                handler.printNameClear(name);
                editTeam(team);
            })
            .catch(console.log);
    }
}

/**
 * @name selectStudentToSubstitute()
 * @description prompt to select the student to be substituted
 * @description If the teams only consists of one student he will be automatically selected
 * @param team  team of the selected student
 */
function selectStudentToSubstitute(team) {

    // check whether teams has 1 or 2 students
    if (team.studenten.length === 2) {

        let selection = converter.getStudentsChoices(team.studenten)
        selection.push(new Choice(back, null));

        inquirer
            .prompt(
                {
                    type: 'list',
                    name: 'menu',
                    message: 'Welchen Studenten wollen Sie ersetzen?',
                    choices: selection
                }
            )
            .then(answer => {
                handler.printNameClear(name);
                (answer.menu === null) ? editTeam(team) : substituteStudent(answer.menu, team);
            })
            .catch(console.log)

    } else {
        substituteStudent(team.studenten[0], team).then().catch(console.log);
    }
}

/**
 * @name substituteStudent()
 * @description                     Function to substitute a student with a new student
 *
 * @param studentToBeSubstituted    the student to be substituted (obviously)
 * @param team                      the selected team of the student
 * @return                          Different messages based on error/success of the api calls
 */
async function substituteStudent(studentToBeSubstituted, team) {

    // prompt to get details of the new student
    await prompt([
        {
            type: 'input',
            name: 'matrikelnummer',
            message: 'Matrikelnummer',
            initial: studentToBeSubstituted.matrikelnummer,
            validate(value) {
                return validator.matrikel(value)
            }
        },
        {
            type: 'input',
            name: 'knummer',
            message: 'k-Nummer',
            initial: studentToBeSubstituted.knummer,
            validate(value) {
                return validator.kNummer(value)
            }
        }
    ])
        .then(answer => {

            // check if student exists
            let newStudent = new Student(answer.matrikelnummer, answer.knummer);
            if (handler.studentExists(newStudent, studenten)) {
                handler.printBox(ERROR('Student existiert bereits'), 'red');
                editTeam(team);
            } else {
                confirmSubstitution(studentToBeSubstituted, newStudent);
            }
        })
        .catch(console.log)

    /**
     * @name confirmSubstitution()
     * @description                     prompt to confirm the substitution of the student
     * @param studentToBeSubstituted    Student to be substituted/removed
     * @param newStudent                Student to be added
     * @return                          Different messages based on error/success of the api calls (new rights etc.)
     */
    async function confirmSubstitution(studentToBeSubstituted, newStudent) {
        // substituting students will withdraw the rights of the old students and give them to the new student
        let msg = 'Sind Sie sicher das der Student ' + HIGHLIGHT(studentToBeSubstituted) +
            ' durch den Student ' + HIGHLIGHT(newStudent.matrikelnummer) + ', ' + HIGHLIGHT(newStudent.knummer) + ' ersetzt werden soll?\n'
        ERROR('Wenn das Team des Studenten bereits ein Repository besitzt, werden dem ersetztem Studenten alle Rechte entzogen und dem neuen Studenten gegeben.\n\n')

        const prompt = new Confirm({
            name: 'confirm',
            message: msg,
            initial: true
        });

        prompt
            .run()
            .then(async function (answer) {
                handler.printNameClear(name);
                if (answer) {

                    // start api call to substitute student
                    let spinner = handler.getSpinner('Student wird ersetzt...').start();
                    await collector
                        .substituteStudentInTeamRepo(studentToBeSubstituted, newStudent)
                        .then(msg => {
                            spinner.stop();

                            // update structure
                            structure = collector.getStructureObject(slug);
                            update(structure);

                            // print messages based on failed/successful api call
                            if (msg === 1) {
                                handler.printBox(HIGHLIGHT('Student wurde ersetzt. \n Dem neuen Student wurden Schreibrechte auf das verlinkte Repository gegeben.'), 'magenta')
                            } else if (msg === 0) {
                                handler.printBox(HIGHLIGHT('Student wurde ersetzt.'), 'magenta');
                            } else if (msg === -1) {
                                handler.printBox(ERROR('Etwas ist schiefgelaufen. Der Student wurde nicht ersetzt.'), 'red');
                            } else if (msg === -2) {
                                handler.printBox(ERROR('Etwas ist extrem schiefgelaufen. Der Student wurde im Repository ersetzt, aber nicht in der lokalen Datei.'), 'red');
                            }

                        })
                        .catch(console.log);
                }
                editTeam(team);
            })
            .catch(console.log);
    }
}

/**
 * @name selectStudentToRemove()
 * @description prompt to select the student to be removed
 * @description If the teams only consists of one student he will be automatically selected
 * @param team  team of the selected student
 */
async function selectStudentToRemove(team) {
    // check whether team ha 1 or 2 students
    if (team.studenten.length === 2) {
        let selection = converter.getStudentsChoices(team.studenten)
        selection.push(new Choice(back, null));

        await inquirer
            .prompt(
                {
                    type: 'list',
                    name: 'menu',
                    message: 'Welchen Studenten möchten Sie entfernen?',
                    choices: selection

                }
            )
            .then(answer => {
                handler.printNameClear(name);
                (answer.menu === null) ? editTeam(team) : confirmRemoving(team.studenten[0], team);
            })
            .catch(console.log);
    } else {
        confirmRemoving(team.studenten[0], team);
    }
}

/**
 * @name confirmRemoving()
 * @description     prompt to confirm the removal of the student
 * @param student   student to be removed
 * @param team      team of the student
 */
function confirmRemoving(student, team) {
    let msg = 'Sind Sie sicher das der Student ' + HIGHLIGHT(student) + ' entfernt werden soll?\n' +
        ERROR('Wenn das Team des Studenten bereits ein Repository besitzt, werden dem Student alle Rechte entzogen.\n\n')

    const prompt = new Confirm({
        name: 'confirm',
        message: msg,
        initial: false
    })
    prompt
        .run()
        .then(answer => {
            (answer) ? removeStudent(student, team).then().catch(console.log) : editTeam(team);
        })
        .catch(console.log);
}

/**
 * @name removeStudent()
 * @description     Function to remove the student
 * @description     The student will loose all its right for his teams repository (if created yet)
 * @param student   Student to be removed
 * @param team      Team of the student
 * @return          messages based on failed/successful api calls
 */
async function removeStudent(student, team) {
    handler.printNameClear(name);
    let spinner = handler.getSpinner('Student wird entfernt...').start();
    // start api call to remove student
    await collector
        .removeStudentFromTeamRepo(student)
        .then(msg => {
            spinner.stop();
            // print messages based on failed/successful api call
            if (msg === 1) {
                handler.printBox(HIGHLIGHT('Student wurde entfernt und die Schreibrechte aufs Repository entzogen.'), 'magenta');
            } else if (msg === 0) {
                handler.printBox(HIGHLIGHT('Student wurde entfernt.'), 'magenta');
            } else if (msg === -1) {
                handler.printBox(ERROR('Etwas ist schiefgelaufen. Der Student wurde nicht entfernt.'), 'red');
            }
        })

    // update structure
    update(collector.getStructureObject(slug));
    editTeam(team);
}


/****************** FUNCTIONS FOR TEAM REPOSITORIES ******************/

/**
 * @name getTeamRepoTemplate()
 * @description     prompt to ask user what template to be used when creating the repositories for each **team**
 */
async function getTeamRepoTemplate() {
    let year = new Date().getFullYear().toString().substr(2, 3)
    let urlInitial = (Number(structure.teamRepo.url) === -1) ? 'https://bitbucket.student.fiw.fhws.de:8443/' + INFO(' >> pfad_zum_repository << ') + HIGHLIGHT('.git') : structure.teamRepo.url
    await prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Name der Vorlage' + '\t' + NOTE('Die einzelnen Repositorys bekommen jeweils eine ID an den Namen angehängt: PVS21Exam01\n'),
            initial: 'PVS' + year + 'Exam',
            validate: async (name) => {
                return validator.templateName(name)
            }
        },
        {
            type: 'input',
            name: 'url',
            message: 'URL der Vorlage\n' + HIGHLIGHT('Schreiben Sie "null", wenn das Repository nicht initialisiert werden soll.\n'),
            initial: urlInitial,
            validate: async (url) => {
                return validator.templateURL(url)
            }
        }
    ])
        .then(result => {
            //update structure teamRepo template name
            structure.teamRepo.name = result.name;
            collector.saveStructureObject(structure);

            if (result.url === 'null') {
                // empty template url (wished)
                structure.teamRepo.url = null;
                collector.saveStructureObject(structure);
                createTeamRepositories();
            } else {
                // validate url
                validateUrl(result.url);
            }
        })
        .catch(console.log);
}

/**
 * @name validateUrl()
 * @description function to check whether a url is valid and asks the user to submit again if invalid
 * @description a url is invalid if the user has not the needed rights to clone the repository of the url
 * @param url   url to be validated
 */
async function validateUrl(url) {
    // validate Url
    await collector
        .validateURL(url)
        .then(valid => {
            if (valid) {
                //update structure teamRepo template url
                structure.teamRepo.url = url;
                collector.saveStructureObject(structure);

                // forward to team repository creation
                createTeamRepositories().then().catch(console.log);
            } else {
                handler.printNameClear(name);
                handler.printBox(ERROR('Die angegebene URL ist ungültig.\nBitte geben Sie eine gültige URL an.'), 'red')

                // open prompt to insert url again
                const prompt = new Input({
                    name: 'url',
                    message: 'URL der Vorlage\n',
                    initial: 'https://bitbucket.student.fiw.fhws.de:8443/' + INFO(' >> pfad_zum_repository << ') + HIGHLIGHT('.git'),
                    validate: async (url) => {
                        return validator.templateURL(url)
                    }
                });

                prompt
                    .run()
                    .then(input => {
                        validateUrl(input);
                    })
                    .catch(console.log)
            }
        })
}


/**
 * @name createTeamRepositories()
 * @description Function to create the repositories for each **team**
 * @returns     different messages for each error or success
 */
async function createTeamRepositories() {
    handler.printNameClear(name);
    let spinner = handler.getSpinner('Repositories werden erstellt...');
    spinner.start();
    // start api call
    await collector
        .createRepositoriesForTeams()
        .then(async function (creationMsg) {
            spinner.stop();
            // print messages based on api call failure/success
            if (creationMsg === -1) {   // error: no repositories have been created
                handler.printNameClear(name);
                handler.printBox(ERROR('Etwas ist schiefgelaufen. Es wurden keine Repositories erstellt.'), 'red');
                runSelection();
            } else if (creationMsg === 0) {    // error: name already in use
                handler.printNameClear(name);
                handler.printBox(ERROR('Der Name wird bereits verwendet. Es wurden keine Repositories erstellt.'), 'red');
                getTeamRepoTemplate().then().catch(console.log);
            } else {
                // repositories have been created and can be initialized now
                if (Number(structure.teamRepo.url) !== -1) {    // template url is NOT -1 so the repositories dont have to be initialized
                    spinner = handler.getSpinner('Repositories werden initialisiert...');
                    spinner.start();
                    // start initializing
                    await collector.initRepositoriesForTeams().then(initMsg => {
                        spinner.stop();
                        handler.printNameClear(name);

                        if (initMsg === -1) {   // error: no repositories have been initialized
                            handler.printBox(ERROR('Etwas ist schiefgelaufen. Die Repositories wurden erstellt aber nicht initialisiert.'), 'red');
                        } else if (initMsg === 0) {
                            handler.printBox(ERROR('Die Repositories wurden ohne Struktur initialisiert.'), 'red');
                        } else if (initMsg === 1) { // success: the repositories have been initialized
                            handler.printBox(HIGHLIGHT('Die Repositories wurden erstellt und initialisiert.'), 'magenta');
                            structure = collector.getStructureObject(slug);
                            update(structure);
                        }
                        runSelection();
                    })
                        .catch(console.log)
                } else {    // the repositorys have been created but not initialized cause of an empty template url (users choice)
                    handler.printNameClear(name);
                    handler.printBox(INFO('Die Repositories wurden erstellt.'), 'green');
                    runSelection();
                }
            }
        })
        .catch(console.log);
}

/**
 * @name freezeRepos()
 * @description prompt to ask if the repositories should be frozen
 * @description Prompt contains the official date **'Einfrieren der Repositories am DD.MM.YYYY um HH.MM Uhr'**
 */
function freezeRepos() {

    const prompt = new Confirm({
        name: 'question',
        message: 'Sind Sie sicher, das Sie alle Repositories schließen wollen?'
    });
    prompt
        .run()
        .then(ans => {
            if (ans) {
                freeze().then().catch(console.log);
            } else {
                handler.printNameClear(name);
                runSelection();
            }
        })
        .catch(console.log);

    /**
     * @name freeze()
     * @description function to make api call of freezing the team repositories of current Exam repository
     * @return      messages based on failed/successful api calls
     */
    async function freeze() {
        handler.printNameClear(name);
        let spinner = handler.getSpinner('Repositories werden eingefroren...').start();
        // start api call to freeze repositories
        await collector
            .freezeRepositoriesForTeams()
            .then(() => {
                spinner.stop();
                handler.printBox(HIGHLIGHT('Repositories wurden eingefroren.'), 'magenta')
                runSelection();
            })
            .catch(console.log);
    }
}

/**
 * @name cloneRepos()
 * @description prompt to ask the destination/path of cloning the team repositories
 */
function cloneRepos() {
    const prompt = new Input({
        message: 'Geben Sie den Pfad an:',
        initial: '/Users/user...'
    });

    prompt
        .run()
        .then(answer => {
            clone(answer).then().catch(console.log);
        })
        .catch(console.log);

    /**
     * @name clone()
     * @description the team repositories of current exam repository will be cloned to destination directory
     * @param path  destination folder
     * @return      messages based on failed/successful api calls
     */
    async function clone(path) {
        handler.printNameClear(name);
        let spinner = handler.getSpinner('Repositories werden geklont...').start();
        // start api call to clone repositories
        collector
            .cloneRepositoriesForTeams(path)
            .then(() => {
                spinner.stop();
                handler.printBox(HIGHLIGHT('Repositories wurden erfolgreich geklont.'), 'magenta');
                runSelection();
            })
            .catch(console.log);
    }
}


