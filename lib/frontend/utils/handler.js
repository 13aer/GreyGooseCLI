const chalk = require('chalk');
const boxen = require('boxen');
const clear = require('clear')
require('./globals')

const collector = require('../../data/interface')

module.exports = {

    printHeader() {
        return createHeader();
    },
    /**
     * @name exitCLI()
     * @description prints a random exit message to the cli and exits the process
     */
    exitCLI() {
        console.log(generateExitMsg());
        process.exit(0);
    },
    /**
     * @name printBox()
     * @description     prints a custom info-box to the terminal
     * @param msg       message to be printed
     * @param color     color of box border, should be matched with msg color
     */
    printBox(msg, color) {
        return console.log(boxen(msg, {borderStyle: 'round', borderColor: color}));
    },
    printNameClear(repositoryName) {
        clear();
        return printName(repositoryName);
    },
    findTopic(topics, scope) {
        return findRndTopic(topics, scope);
    },
    /**
     * @name getFreeTopics()
     * @description function to return all available topics without a team
     * @return {Buffer | any[] | string}    Topic-Objects
     */
    getFreeTopics() {
        return collector.getAssignmentsWithNoTeams(1).concat(collector.getAssignmentsWithNoTeams(2));
    },
    /**
     * @name hasMissingStudent()
     * @description         function to check if a student is missing in a team/topic with scope 2
     * @param topics        topics to search in
     * @return {boolean}    true if there is a topic with scope 2 but only one student
     */
    hasMissingStudent(topics) {
        return findMissingStudentInTopic(topics) !== -1;
    },

    getIncId(list) {
        return getIncID(list);
    },
    deleteItem(list, item) {
        return deleteItemFromList(list, item);
    },
    studentExists(student, studentsList) {
        return isStudentExists(student, studentsList);
    },
    parseDate(datetime) {
        return parseDate(datetime);
    },

    /**
     * @name getSpinner()
     * @description function to create a console spinner while waiting for async functions promises
     * @param msg          Message to be shown when spinning
     * @return {Instance}   Spinner Instance with custom message and set values
     */
    getSpinner(msg) {
        const ora = require('ora');
        return ora({
            text: SUBNOTE(msg),
            color: 'cyan',
            spinner: {
                interval: 50,
                frames: [
                    "◜",
                    "◠",
                    "◝",
                    "◞",
                    "◡",
                    "◟"
                ]
            }
        });
    }
}

/**
 * @name createHeader()
 * @description function to clear console and create the main header of the PEG cli
 */
function createHeader() {
    clear();
    const figlet = require('figlet');
    const {description, version} = require('../../../package.json');
    let header = chalk.yellowBright(figlet.textSync('PEG', {horizontalLayout: 'full'}))
    console.log(boxen(header + ' ', {borderStyle: 'round', borderColor: 'black'}))
    console.log(chalk.yellowBright(' Version %s\n %s\n'), version, description)
}


function generateExitMsg() {
    let goodbyes = [
        "Goodbye",
        "Farewell",
        "See You Soon",
        "Bye Bye",
        "Ciao Ciao",
        "Arivederci",
        "Au revoir",
        "Adios",
        "Bon-voyage",
        "Sayonara",
        "Tschüß"
    ];
    let randomBye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
    let msg = chalk.whiteBright`${randomBye}!`
    return boxen(msg, {borderStyle: 'round', borderColor: 'white'});
}


/**
 * @name parseDate()
 * @description parses string input into dates
 * @param datetime      menu input with format DD.MM.YYYY HH.MM
 * @returns {Date}
 */
function parseDate(datetime) {

    let date = datetime.split(' ')[0]
    let time = datetime.split(' ')[1]
    let day = date.split('.')[0]
    let month = date.split('.')[1]
    let year = date.split('.')[2]

    let result = year + '-' + month + '-' + day

    if (time !== undefined) {
        let hour = time.split('.')[0]
        let min = time.split('.')[1]
        result += 'T' + hour + ':' + min + ':00'
    }
    return new Date(result)
}

/**
 * @name printName()
 * @description Clears console and prints name of repository in a box
 * @param name  Name of the current Repository
 * @returns void
 */
function printName(name) {
    console.log(boxen(chalk.cyanBright(name), {borderStyle: 'round', borderColor: 'cyan'}));
}

/**
 * @name getIncID()
 * @description generates a new **ID** based on the existing ID's
 * @description new ID does ignore missing ID's, it always highest ID + 1
 * @requires list objects need to have an attribute 'id'
 * @param list  list with items that have an ID
 * @returns {number} new ID
 */
function getIncID(list) {
    let max_val = 0;
    for (let item of list) {
        if (item.id > max_val) max_val = item.id;
    }
    return max_val + 1;
}

/**
 * @name deleteItemFromList()
 * @description deletes the item from the given list
 * @param list  contains the item to be deleted
 * @param item  to be deleted
 * @returns {*} new list without item
 */
function deleteItemFromList(list, item) {
    return list.filter(val => val !== item);
}

/**
 * @name isStudentExists()
 * @description Checks whether a student is already existing in given list
 * @param student       student to be checked to exist
 * @param studentsList  list of students to be searched for student
 * @returns {boolean} true if student exists, false if not
 */
function isStudentExists(student, studentsList) {
    return studentsList.find(s => (s.matrikelnummer === student.matrikelnummer && s.knummer === student.knummer)) !== undefined;
}

/**
 * @name findRndTopic()
 * @description Finds a a random, unassigned topic with given scope
 * @description If there is a student missing in a team/topic with scope 2, this topic will be prioritized
 * @param topics    all topics in structure
 * @param scope     1 or 2, depends on how many students will be added
 * @returns {number|*} the found topic
 */
function findRndTopic(topics, scope) {
    scope = parseInt(scope)
    let matchingTopic;
    if (scope === 1) {  // If scope is 1 we first need to check if there is a team with scope 2 that is missing a student
        matchingTopic = findMissingStudentInTopic(topics)
        if (matchingTopic !== -1) return matchingTopic;   // There is a student missing in a topic with scope 2.
    }
    let freeTopics = collector.getAssignmentsWithNoTeams(scope)
    let found = false;
    let id = getRandomInt(topics.length);
    while (!found) {
        matchingTopic = freeTopics.find(t => t.id === id)
        matchingTopic === undefined ? id = getRandomInt(topics.length) : found = true;

    }
    return matchingTopic;
}

/**
 * @name findMissingStudentInTopic()
 * @description Searches topics for missing student in teams with scope = 2
 * @description -1 is returned if all scope-2-teams are fully filled
 * @param topics
 * @returns {number} topic which is missing a student or -1 if all scope-2-teams are filled
 */
function findMissingStudentInTopic(topics) {
    let topicWithMissingStudent = -1
    for (let topic of topics) {
        let team = collector.getTeamForAssignment(topic)
        if (team !== -1) {
            if (topic.umfang === '2' && team.studenten.length === 1) {
                topicWithMissingStudent = topic;
                break;
            }
        }
    }
    return topicWithMissingStudent;
}

/**
 * @name getRandomInt()
 * @description         Generates an Integer between 1 (inclusive) and the maxValue (inclusive)
 * @param maxValue      highest Value to be generated
 * @returns {number}    random Integer
 */
function getRandomInt(maxValue) {
    return Math.floor(Math.random() * Math.floor(maxValue) + 1);
}
