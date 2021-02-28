const api = require("../backend/interface");
const conv = require("./converter/response-choice-converter");
const handler = require("./handler/SaveFileHandler");
const path = require("path");
const fse = require("fs-extra");
const Conf = require("conf");

/**
 * @type {Conf<Record<string, unknown>>}
 * @description handler for all Repositories with a saveFile
 */
const storage = new Conf({
    configName: "knownExams"
});
if (!storage.has("REMINDER"))
    storage.set("REMINDER", "Deleting or altering any data in this File will disable the CLI to show the corresponding Repository!");

let saveFileHandler;

/**
 * @param {number} milliseconds
 * @description convenience function to pause the current process for the given milliseconds
 */
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

module.exports = {
    /**
     * @name getAllRepositoriesAsChoice
     * @type async function
     * @return {Promise<Choice<Repository>[]>}
     * all Repositories as Choice
     * @description loads all Repositories form the api and converts them to a Choice-Array
     */
    getAllRepositoriesAsChoice: async function () {
        let repo = await api.getRepositories();
        return conv.getRepositoryAsChoice(repo);
    },

    /**
     * @name getAllRepositoriesWithSaveFile
     * @type async function
     * @return {Promise<Choice<Repository>[]>}
     * all Repositories with an existing saveFile, if the file is known to the CLI
     * @description loads all Repositories from the api, removes all Repositories unknown to the CLI and
     * converts the remaining to a Choice-Array
     */
    getAllRepositoriesWithSaveFile: async function () {
        let repo = await api.getRepositories();
        for (let i = 0; i < repo.values.length; i++) {
            if (!storage.has("Exams." + repo.values[i].slug)) {
                repo.values.splice(i, 1);
                i--;
            }
        }
        return conv.getRepositoryAsChoice(repo);
    },

    /**
     * @name getAllUsersAsChoice
     * @type async function
     * @return {Promise<Choice<User>[]>}
     * all Users as Choice
     * @description loads all Users from the api and converts them to a Choice-Array
     */
    getAllUsersAsChoice: async function () {
        let user = await api.getUsers();
        return conv.getUserAsChoice(user);
    },

    /**
     * @name getAllProjectsAsChoice
     * @type async function
     * @return {Promise<Choice<Project>[]>}
     * all Projects as Choice-Array
     * @description loads all Projects from the api and converts them to a Choice-Array
     */
    getAllProjectsAsChoice: async function () {
        let project = await api.getProjects();
        return conv.getProjectAsChoice(project);
    },

    /**
     * @name getStructureObject
     * @type function(string)
     * @param {string} slug
     * the name of the File in which the Structure will be saved/loaded from
     * @return {Structure}
     * the structure-Object from the File if it exists, a new and empty structure-Object otherwise
     * @description if a File with the name exists: loads the Structure-Object from the stored File
     * @description if a File with the name doesn't exist: creates it and returns a new Structure-Object
     */
    getStructureObject: function (slug) {
        saveFileHandler = new handler(slug);
        return saveFileHandler.Structure;
    },

    /**
     * @name saveStructureObject
     * @type function(Structure): void
     * @param {Structure} structureObject
     * @description overwrites the structureObject in the File completely and saves it to the knownExams
     */
    saveStructureObject: function (structureObject) {
        if (!storage.has("Exams." + structureObject.slug)) storage.set("Exams." + structureObject.slug, true);
        saveFileHandler = new handler(structureObject.slug)
        saveFileHandler.overWriteAll(structureObject);
        saveFileHandler.loadAll();
    },

    /**
     * @name removeStudentFromTeamRepo
     * @type async function
     * @param {number} mNumber
     * the Matrikelnummer of the Student-Object
     * @return {Promise<number>}
     * number from -1 to 1 representing which operations where performed
     * @description 0: removes Student from Students-Array and Teams-Object, saves to File
     * @description 1: also removes Student from Remote
     * @description 2: also deletes the Remote Repository
     * @description --1: no changes happened to the local file and remote
     */
    removeStudentFromTeamRepo: async function (mNumber) {
        let kNumber = saveFileHandler.Students.getName(mNumber);
        let repoName = saveFileHandler.Teams.getRepositorySlugForStudent(mNumber);
        let teamId = saveFileHandler.Teams.getIdForStudent(mNumber);
        let assignmentId = saveFileHandler.Teams.get(teamId).themaID;
        if (repoName === -1) {
            saveFileHandler.Students.delete(mNumber);
            saveFileHandler.Teams.deleteStudent(mNumber);
            saveFileHandler.saveAll();
            return 0;
        }
        let r = await api.removeUserFromRepository(repoName, kNumber);
        if (r.statusCode === 204) {
            saveFileHandler.Students.delete(mNumber);
            saveFileHandler.Teams.deleteStudent(mNumber);
            if (saveFileHandler.Teams.get(teamId) === -1) {
                await api.deleteRepository(repoName);
                saveFileHandler.Assignments.setRepository(assignmentId, -1);
                saveFileHandler.saveAll();
                return 2;
            }
            saveFileHandler.saveAll();
            return 1;
        }
        saveFileHandler.loadAll();
        return -1;
    },

    /**
     * @name substituteStudentInTeamRepo
     * @type async function
     * @param {number} mNumberToRemove
     * the Matrikelnummer of the Student-Object which will be replaced
     * @param {Student} studentObjToAdd
     * the Student which will be added
     * @return {Promise<number>}
     * number from -2 to 1 representing which operations where performed
     * @description 0: replaces one Student-Object with a new Student-Object in the Students-Array and in
     * the Teams-Array, then saves the new Data to the File
     * @description 1: also replaced Student on Remote
     * @description --1: no changes happened to the local file and remote
     * @description --2: Student was only removed on remote, the add-operation failed, no changes to the local File
     */
    substituteStudentInTeamRepo: async function (mNumberToRemove, studentObjToAdd) {
        let kNumberToRemove = saveFileHandler.Students.getName(mNumberToRemove);
        let repoName = saveFileHandler.Teams.getRepositorySlugForStudent(mNumberToRemove);
        if (repoName === -1) {
            saveFileHandler.Students.delete(mNumberToRemove).add(studentObjToAdd);
            saveFileHandler.Teams.replaceStudent(mNumberToRemove, studentObjToAdd.matrikelnummer);
            saveFileHandler.saveAll();
            return 0;
        }
        let r = await api.removeUserFromRepository(repoName, kNumberToRemove);
        if (r.statusCode === 204) {
            sleep(1000); // api-safety
            r = await api.addUserToRepository(repoName, studentObjToAdd.knummer);
            if (r.statusCode === 204) {
                saveFileHandler.Students.delete(mNumberToRemove).add(studentObjToAdd);
                saveFileHandler.Teams.replaceStudent(mNumberToRemove, studentObjToAdd.matrikelnummer);
                saveFileHandler.saveAll();
                return 1;
            }
            saveFileHandler.loadAll();
            return -2;
        }
        saveFileHandler.loadAll();
        return -1;
    },

    /**
     * @name addStudentToTeam
     * @type async function
     * @param {Student} studentObj
     * the Student-Object to add
     * @param {Team} teamObj
     * the Team-Object to add
     * @return {Promise<number>}
     * number from -1 to 1 representing which operations where performed
     * @description 0: adds a Student-Object to the Students-Array and the Team
     * @description 1: gives the Student write Access to the Remote-Repository linked to the Team-Object
     * @description --1: no changes where made, local File will not be altered
     */
    addStudentToTeam: async function (studentObj, teamObj) {
        saveFileHandler.Students.add(studentObj);
        let slug = saveFileHandler.Teams.addStudent(teamObj.id, studentObj.matrikelnummer).getRepositorySlugForTeam(teamObj.id);
        if (slug === -1) {
            saveFileHandler.saveAll();
            return 0;
        }
        let r = await api.addUserToRepository(slug, studentObj.knummer);
        if (r.statusCode === 204) {
            saveFileHandler.saveAll();
            return 1;
        }
        saveFileHandler.loadAll();
        return -1;
    },

    /**
     * @name createTeam
     * @type {function(Team)}
     * @param {Team} teamObj
     * the Team to be added
     * @description adds a Team to the Array, if not already present in the Array and saves it to the File
     */
    createTeam: function (teamObj) {
        saveFileHandler.Teams.add(teamObj);
        saveFileHandler.saveTeams();
    },

    /**
     * @name createStudent
     * @type {function(Student)}
     * @param {Student} studentObj
     * the Student to add
     * @description adds a Student-Object to the Array, if not already present and saves it to the File
     */
    createStudent: function (studentObj) {
        saveFileHandler.Students.add(studentObj);
        saveFileHandler.saveStudents();
    },

    /**
     * @name pushNewReadme
     * @type async function
     * @param {string} slug
     * the slug in which the Readme will be pushed
     * @param {string} readmeContent
     * the content of the Readme-File in String-format
     * @param {string} [commitMsg]
     * @default adding/updating files
     * the commit-message for the git-operation
     * @description Clones remote-repo into temp, overwrites README.md and pushes back to remote
     */
    pushNewReadme: async function (slug, readmeContent, commitMsg) {
        api.deleteTempRepo();
        await api.pushNewReadme(slug, readmeContent, commitMsg);
    },

    /**
     * @name createExam
     * @type async function
     * @param {string} examName
     * the Name of the Exam Repository e.g. PUVS21Exam
     * @param {string} [readmeContent]
     * the Content of the README.md as string, will push whatever content ist provided as README.md File
     * @return {Promise<string|number>}
     * the slug from the created Repository
     * @description creates a Repository on the Remote-Server with the given name and public access, then pushes a README.md and returns
     * the slug of the Repository if successful, returns -1 if the exam already exists in the knownExams file
     * @example createExam("PUVS21SummerExam", README-CONTENT) >> "puvs21summerexam"
     */
    createExam: async function (examName, readmeContent) {
        api.deleteTempRepo();
        let c = await api.checkRepositoryExistence(examName);
        if (storage.has("Exams." + examName.replace(/ /g, '-').toLowerCase()) || c === 200) return -1;
        sleep(500) // api-safety
        await api.createExamRepository(examName, true, readmeContent);
        sleep(1000); // api-safety
        return api.getRepository(examName).then(function (r) {
            return r.slug;
        });
    },

    /**
     * @name createRepositoriesForTeams
     * @type async function
     * @return {Promise<number>}
     * number from -1 to 1 representing which operations where performed
     * @description 1: creates a Repository for a Team on the Remote, gives all Students write-access to it and adds the
     * browse-link to the team-object
     * @description 0: the chosen name is already in use
     * @description --1: nothing was changed
     */
    createRepositoriesForTeams: async function () {
        let teamsArray = saveFileHandler.Teams.getAll();
        let name = saveFileHandler.Structure.teamRepo.name;
        let ret = -1;
        if (await api.checkRepositoriesExistence(name)) return 0;
        for (let i = 0; i < teamsArray.length; i++) {
            if (saveFileHandler.Assignments.get(teamsArray[i].themaID).link === -1) {
                let id = (teamsArray[i].themaID < 10) ? '0' + teamsArray[i].themaID : teamsArray[i].themaID.toString();
                let slug = await api.createRepository(name + id);
                saveFileHandler.Teams.addRepositorySlug(teamsArray[i].themaID, slug);
                sleep(2000); // api-safety
                let link = await api.getRepositoryBrowseLink(slug);
                saveFileHandler.Assignments.setRepository(teamsArray[i].themaID, link);
                for (let j = 0; j < teamsArray[i].studenten.length; j++) {
                    let user = saveFileHandler.Students.getName(teamsArray[i].studenten[j]);
                    await api.addUserToRepository(slug, user);
                    sleep(500); // api-safety
                }
                saveFileHandler.saveAll();
            }
            ret = 1;
        }
        return ret;
    },

    /**
     * @name initRepositoriesForTeams
     * @type async function
     * @return {Promise<number>}
     * number from -1 to 1 representing which operations where performed
     * @description 1: cloned a repository from the remote and pushed it to all known team-repositories
     * @description 0: no template was pushed
     * @description --1: the check of the Remote-Link failed, nothing happened
     */
    initRepositoriesForTeams: async function () {
        api.deleteTempRepo();
        let linkToTemplate = saveFileHandler.Structure.teamRepo.url;
        let teamsArray = saveFileHandler.Teams.getAll();
        let ret = 0;
        if (linkToTemplate === null || linkToTemplate === undefined) return ret;
        if (!await api.checkURL(linkToTemplate)) return -1;
        sleep(500); // api-safety
        const repo = await api.cloneTemplateRepository(linkToTemplate);
        for (let i = 0; i < teamsArray.length; i++) {
            let slug = teamsArray[i].repository;
            if (slug !== -1 && !saveFileHandler.Teams.checkInitialized(teamsArray[i].id)) {
                saveFileHandler.Teams.setInitialized(teamsArray[i].id);
                let url = await api.getRepositoryGitLink(slug);
                sleep(1000); // api-safety
                await api.pushTemplateRepository(url, repo);
                ret = 1;
                sleep(500); // api-safety
            }
        }
        saveFileHandler.saveTeams();
        return ret;
    },

    /**
     * @name freezeRepositoriesForTeams
     * @type async function
     * @return {Promise<void>}
     * @description sets all users in the teamsArray to read-access in their repositories
     */
    freezeRepositoriesForTeams: async function () {
        let teamsArray = saveFileHandler.Teams.getAll();
        for (let i = 0; i < teamsArray.length; i++) {
            for (let j = 0; j < teamsArray[i].studenten.length; j++) {
                let user = saveFileHandler.Students.getName(teamsArray[i].studenten[j]);
                await api.addUserToRepository(teamsArray[i].repository, user, "REPO_READ");
                sleep(1000); // api-safety
            }
        }
    },

    /**
     * @name cloneRepositoriesForTeams
     * @type async function
     * @param {string} pathToFolder
     * the path to the folder where the repos will be cloned in
     * @return {Promise<void>}
     * @description creates a new folder for each team/repository in the given path and clones the remote repository to it
     */
    cloneRepositoriesForTeams: async function (pathToFolder) {
        let teamsArray = saveFileHandler.Teams.getAll();
        for (let i = 0; i < teamsArray.length; i++) {
            if (teamsArray[i].repository != -1) {
                let url = await api.getRepositoryGitLink(teamsArray[i].repository);
                let pathToRepo = path.resolve(__dirname, pathToFolder, teamsArray[i].repository.toString());
                fse.ensureDir(pathToRepo).then(function () {
                    api.cloneRepositoryToFolder(pathToRepo, url);
                });
                sleep(1000); // api-safety
            }
        }
    },

    /**
     * @name getAssignmentsWithNoTeams
     * @type {function(number)}
     * @param {number} sizeOfAssignment
     * the "umfang" of the Assignments
     * @return {Thema[]}
     * the Array with all Assignments with the given size and without a connected Team
     */
    getAssignmentsWithNoTeams: function (sizeOfAssignment) {
        let assignments = saveFileHandler.Assignments.getWithSize(sizeOfAssignment);
        for (let i = 0; i < assignments.length; i++) {
            if (saveFileHandler.Teams.getIdForAssignment(assignments[i].id) !== -1) {
                assignments.splice(i, 1);
                i--;
            }
        }
        return assignments;
    },

    /**
     * @name getTeamForAssignment
     * @type {function(Thema)}
     * @param {Thema} Assignment
     * the AssignmentObject
     * @return {Team|number}
     * the Team which is connected to the Assignment
     * @description searches for a Team which is related to the given Assignment, returns -1 if nothing is found
     */
    getTeamForAssignment: function (Assignment) {
        let id = saveFileHandler.Teams.getIdForAssignment(Assignment.id);
        return (id === -1) ? id : saveFileHandler.Teams.get(id);
    },

    /**
     * @name deleteRepositories
     * @type async function
     * @return {Promise<void>}
     * @description deletes all Repositories on the Remote for all Teams
     */
    deleteRepositories: async function () {
        let teamsArray = saveFileHandler.Teams.getAll();
        for (let i = 0; i < teamsArray.length; i++) {
            await api.deleteRepository(teamsArray[i].repository);
            sleep(1000) // api-safety
        }
    },

    /**
     * @name changeUsername
     * @type {function(string)}
     * @param {string} userName
     * @description sets a new Username in the credentials
     */
    changeUsername: function (userName) {
        return api.setNewUserName(userName);
    },

    /**
     * @name changePassword
     * @type {function(string)}
     * @param {string} password
     * @description sets a new Password in the credentials
     */
    changePassword: function (password) {
        return api.setNewPassword(password);
    },

    /**
     * @name checkLogin
     * @type async function
     * @param {string} userName
     * @param {string} passWord
     * @return {Promise<boolean>}
     * @description checks if the server responses with 200
     */
    checkLogin: async function (userName, passWord) {
        let res = await api.checkLoginCredentials(userName, passWord);
        return (res === 200);
    },

    /**
     * @name clearLogin
     * @type {function()}
     * @description clears the login.cred file completely
     */
    clearLogin: function () {
        return api.deleteCredentials();
    },

    /**
     * @name showPath
     * @type {function()}
     * @return {string}
     * the path of the stored File
     */
    showPath: function () {
        return storage.path;
    },

    /**
     * @name deleteTempFolder
     * @type {function()}
     * @description convenience function to delete Temp-Folder, if it exists
     */
    deleteTempFolder: function () {
        return api.deleteTempRepo();
    },

    /**
     * @name validateURL
     * @type {function(string)}
     * @param {string} gitURL
     * the Git-Link to the Repository
     * @return {Promise<boolean>}
     * true if the url matches the required format and exists on Remote
     * @description the required Format: "https://bitbucket.student.fiw.fhws.de:8443/scm" + * + ".git"
     */
    validateURL: async function (gitURL) {
        return api.checkURL(gitURL);
    }
}