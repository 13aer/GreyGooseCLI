/**
 * @class Choice(name, value)
 * @description a Choice Object is needed to build a Select Menu with inquirer
 * @description a Choice Object contains a name and a value
 *
 * @param name is how the Choice is shown in the select Menu, this name is generated with the getDescription functions
 * @example "Team 01"
 *
 * @param value is the Object behind the Choice in the select Menu
 * @example {Team}
 */
const {Choice} = require("../../data/converter/models");
const dateformat = require('dateformat');

module.exports = {
    getAppointmentsChoices (appts) {
        return castAppointments2Choice(appts)
    },
    getTopicsChoices (topics) {
        return castTopic2Choice(topics)
    },
    getStudentsChoices (mNumbers) {
        return castStudents2Choice(mNumbers)
    },
    getTeamsChoices (teams, topics) {
        return castTeams2Choice(teams, topics)
    },

    printAppointment (appt) {
        return getAppointmentDescription(appt)
    },
    printStudents (students) {
        return getStudentsDescription(students)
    },
    printID (id) {
        return getIDFormatted(id)
    }
}


/**
 * @name getIDFormatted
 * @type {function()}
 *
 * @description converts the **ID** X to XX
 * @exampleid = 1 will be converted to 01
 *
 * @param id
 * @returns {string|*}
 */
function getIDFormatted(id) {
    return (id < 10) ? ('0' + id) : id;
}

/**
 * @name castTeams2Choice
 * @type {function()}
 *
 * @description Converts the Teams to Choice Objects to be used in select menus
 *
 * @param teams     needed for the value of the Choice Object
 * @param topics    needed for the name of the Choice Object
 * @returns {[]}    Choices Array to be used in menu
 */
function castTeams2Choice(teams, topics) {
    let choices = []
    let last = teams[teams.length - 1];
    for (let team of teams) {
        let name = getTeamDescription(team, topics)
        let value = team
        if (team === last) name += '\n'
        choices.push(new Choice(name, value))
    }
    return choices;
}
/**
 * @name getTeamDescription
 * @type {function()}
 *
 * @description Generates a name for the Choice Object to be displayed in the select menu
 * @example 01  2   Thema-Alpha     M5112233, M5223344
 *
 * @param team             Generate a name for these **Teams**
 * @param topics            Generates a name for the **Topic** of the team
 * @returns {string}        name to be used as Choice.name
 */
function getTeamDescription(team, topics) {
    let topic = topics.find(t => t.id === team.themaID)
    return getIDFormatted(team.id) + '\t' + topic.umfang +'\t\t' + topic.thema + getSpacesForTopicDescription(topic.thema) + getStudentsDescription(team.studenten)
}

/**
 * @name castStudents2Choice
 * @type {function()}
 *
 * @description Converts the Students to Choice Objects to be used in select menus
 *
 * @param mNumbers     needed for the name and value of the Choice Object
 * @returns {[]}        Choices Array to be used in menu
 */
function castStudents2Choice(mNumbers) {
    let choices = []
    for(let mNumber of mNumbers) {
        let matrikel = 'M' + mNumber
        choices.push(new Choice(matrikel, mNumber))
    }
    return choices;
}
/**
 * @name getTopicDescription
 * @type {function()}
 *
 * @description Generates a name for the Choice Object to be displayed in the select menu
 * @example M5112233, M5223344
 *
 * @param students          Generate a name for these **Students**
 * @returns {string}        name to be used as Choice.name
 */
function getStudentsDescription(students) {
    let des = ''
    if (students.length !== 0) {
        for (let student of students) {
            des += 'M' + student + ', '
        }
    }
    return des.slice(0, -2);
}

/**
 * @name castTopic2Choice
 * @type {function()}
 *
 * @description Converts the Topics to Choice Objects to be used in select menus
 *
 * @param topics        needed for the name and value of the Choice Object
 * @returns {[]}        Choices Array to be used in menu
 */
function castTopic2Choice(topics) {
    let choices = []
    let last = topics[topics.length - 1];
    for(let topic of topics) {
        let name = getTopicDescription(topic)
        let value = topic
        if (topic === last) name += '\n'
        choices.push(new Choice(name, value))
    }
    return choices;
}
/**
 * @name getTopicDescription
 * @type {function()}
 *
 * @description Generates a name for the Choice Object to be displayed in the select menu
 * @example 01  2   Thema-Alpha
 *
 * @param topic         Generate a name for this **Topic**
 * @returns {string}    name to be used as Choice.name
 */
function getTopicDescription(topic) {
    return getIDFormatted(topic.id) + '\t' + topic.umfang + '\t' + topic.thema
}
function getSpacesForTopicDescription(topic) {
    let len = topic.length
    if (len <= 5 ) {
        return '\t\t\t\t\t\t';
    } else if (len > 5 && len <= 10) {
        return '\t\t\t\t\t';
    } else if (len > 10 && len <= 15) {
        return '\t\t\t\t';
    } else if (len > 15 && len <= 20) {
        return '\t\t\t';
    } else {
        return '\t\t';
    }
}


/**
 * @name castAppointments2Choice
 * @type {function()}
 *
 * @description Converts the Appointments to Choice Objects to be used in select menus
 *
 * @param appts     appointments; needed for the name and value of the Choice Object
 * @returns {[]}    Choices Array to be used in menu
 */
function castAppointments2Choice(appts) {
    let choices = []
    let last = appts[appts.length - 1];
    for(let appointment of appts) {
        if (
            !appointment.beschreibung.startsWith('Einfrieren der Repositories') &&
            !appointment.beschreibung.startsWith('Mündliche Prüfungen')
        ) {
            let name = getAppointmentDescription(appointment)
            let value = appointment
            if (appointment === last) name += '\n'
            choices.push(new Choice(name, value))
        }
    }
    return choices;
}
/**
 * @name getAppointmentDescription
 * @type {function()}
 *
 * @description Generates a name for the Choice Object to be displayed in the select menu
 * @example Zulosung der Prüfungthemen am 01.01.2021
 *
 * @param appt          Generate a name for this **Appointment**
 * @returns {string}    name to be used as Choice.name
 */
function getAppointmentDescription(appt) {
    require('./globals')
    let datum = (appt.datum === 'TBD') ? appt.datum : dateformat(appt.datum, 'dd.mm.yyyy')
    return appt.beschreibung + ' am ' + HIGHLIGHT(datum);
}