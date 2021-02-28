const {Choice, Repository, User, Project} = require("./models");

/**
 * @param data
 * the body of a Bitbucket-Api call
 * @return {Choice<Project>[]}
 * the Projects as Choice-Array
 * @description builds Project-Objects from the values of the server-response-body and fills them into an Array,
 * then builds Choice-Objects from the Project-Array and fills them into an Array
 */
exports.getProjectAsChoice = function (data) {

    const values = data.values;
    let projects = [];

    for (let i = 0; i < values.length; i++) {
        projects[i] = new Project(
            values[i].key,
            values[i].id,
            values[i].name,
            values[i].isPublic,
            values[i].type,
            values[i].links.self[0].href
        )
    }

    let choicesArray = [];
    for (let i = 0; i < projects.length; i++) {
        choicesArray[i] = new Choice(
            projects[i].getDescription(),
            projects[i]
        )
    }
    return choicesArray;
}

/**
 * @param data
 * the body of a Bitbucket-Api call
 * @return {Choice<User>[]}
 * the Users as Choice-Array
 * @description builds User-Objects from the values of the server-response-body and fills them into an Array,
 * then builds Choice-Objects from the User-Array and fills them into an Array
 */
exports.getUserAsChoice = function (data) {

    const values = data.values;
    let users = [];

    for (let i = 0; i < values.length; i++) {
        users[i] = new User(
            values[i].name,
            values[i].emailAddress,
            values[i].id,
            values[i].displayName,
            values[i].active,
            values[i].slug,
            values[i].type,
            values[i].directoryName,
            values[i].deletable,
            values[i].lastAuthenticationTimestamp,
            values[i].mutableDetails,
            values[i].mutableGroups,
            values[i].links.self[0].href
        )
    }

    let choicesArray = [];
    for (let i = 0; i < users.length; i++) {
        choicesArray[i] = new Choice(
            users[i].getDescription(),
            users[i]
        )
    }
    return choicesArray;
}

/**
 * @param data
 * the body of a Bitbucket-Api call
 * @return {Choice<Repository>[]}
 * the Repositories as Choice-Array
 * @description builds Repository-Objects from the values of the server-response-body and fills them into an Array,
 * then builds Choice-Objects from the Repository-Array and fills them into an Array
 */
exports.getRepositoryAsChoice = function (data) {

    const values = data.values;
    let repositoryArray = [];

    for (let i = 0; i < values.length; i++) {
        repositoryArray[i] = new Repository(
            values[i].slug,
            values[i].id,
            values[i].name,
            values[i].scmId,
            values[i].state,
            values[i].statusMessage,
            values[i].forkable,
            values[i].project,
            values[i].public,
            values[i].links.self[0].href
        )
    }

    let choicesArray = [];
    for (let i = 0; i < repositoryArray.length; i++) {
        choicesArray[i] = new Choice(
            repositoryArray[i].getDescription(),
            repositoryArray[i]
        )
    }
    return choicesArray;
}