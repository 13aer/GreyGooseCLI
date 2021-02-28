const push = require("./git/push");
const get = require("./bitbucket/get");
const post = require("./bitbucket/post");
const update = require("./git/update");
const del = require("./bitbucket/delete");
const handler = require("./handler/repository");
let auth = require("./bitbucket/auth");

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
     * @param {string} [projectName]
     * @default PUVS
     * @return {Repository[]}
     * all Repositories in given project as Object
     */
    getRepositories: function (projectName) {
        return get.allRepositories(projectName);
    },

    /**
     * @param {string} repositoryName
     * @param {string} [projectName]
     * @default PUVS
     * @return {Repository}
     * the Repository with given name in given project as Object
     */
    getRepository: function (repositoryName, projectName) {
        return get.oneRepository(repositoryName, projectName);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @return {string}
     * Git_Link of Repository
     */
    getRepositoryGitLink: function (repoName, projectName) {
        return get.repositoryGitLink(repoName, projectName);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @return {string}
     * Browse-Link of Repository
     */
    getRepositoryBrowseLink: function (repoName, projectName) {
        return get.repositoryBrowseLink(repoName, projectName);
    },

    /**
     * @return  {User[]}
     * all Users as Object
     */
    getUsers: function () {
        return get.allUsers();
    },

    /**
     * @param {string} user
     * the username for Bitbucket
     * @return {User}
     * one User as Object
     */
    getUser: function (user) {
        return get.oneUser(user);
    },

    /**
     * @return {Project[]}
     * all Projects Object
     */
    getProjects: function () {
        return get.allProjects();
    },

    /**
     * @param {string} [projectName]
     * @default PUVS
     * @return {Project}
     * the given project as Object
     */
    getProject: function (projectName) {
        return get.oneProject(projectName);
    },

    /**
     * @param {string} repositoryName
     * @param {boolean} [isPublic]
     * @default false
     * @param {string} [projectName]
     * @default PUVS
     * @param {string} [fileContent]
     * will push README.md with whatever content is provided
     * @returns {Promise<values>}
     * the response from the server as promise
     */
    createExamRepository: function (repositoryName, isPublic, fileContent, projectName) {
        return post.createRepo(repositoryName, isPublic, projectName)
            .then(async function (resp) {
                sleep(2000);
                let url = await get.repositoryGitLink(resp.body.slug, projectName);
                sleep(2000);
                return push.pushReadme(url, fileContent);
            });
    },

    /**
     * @param {string} repositoryName
     * @param {string} [projectName]
     * @default: PUVS
     * @return {string}
     * slug of the created Repository
     */
    createRepository: async function (repositoryName, projectName) {
        return post.createRepo(repositoryName, false, projectName).then(function (r) {
            return r.body.slug;
        });
    },

    /**
     * @param {string} slug
     * the slug in which the Readme will be pushed
     * @param {string} fileContent
     * the content of the Readme-File in String-format
     * @param {string} [message]
     * @default adding/updating files
     * the commit-message for the git-operation
     * @description Clones remote-repo into temp, overwrites README.md and pushes back to remote
     */
    pushNewReadme: async function (slug, fileContent, message) {
        let urlToRemote = await get.repositoryGitLink(slug);
        sleep(2000);
        return update.updateReadme(urlToRemote, fileContent, message)
    },

    /**
     * @description convenience function to instant clear temp-repo (removes it completely)
     */
    deleteTempRepo: function () {
        return require("./handler/repository").clearTempRepo();
    },

    /**
     * @param {string} url
     * the Git-Link to the Repository
     * @returns {Promise<boolean>}
     * true if the url matches the required format and exists on Remote
     * @description the required Format: "https://bitbucket.student.fiw.fhws.de:8443/scm" + * + ".git"
     */
    checkURL: function (url) {
        return get.checkRepositoryLink(url);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @param {string} userName
     * the Bitbucket-Username
     * @param {string} [permission]
     * @default REPO_WRITE
     * @return {Promise<*>}
     * the server response
     * @description gives a User write access to a Repository
     */
    addUserToRepository: function (repoName, userName, permission, projectName) {
        return post.addUserToRepo(repoName, userName, permission, projectName);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @param {string} userName
     * @returns {Promise<*>}
     * the server response
     */
    removeUserFromRepository: function (repoName, userName, projectName) {
        return del.deleteUserFromRepo(repoName, userName, projectName);
    },

    /**
     * @param {string} urlToRemote
     * the git-Link to the Repository
     * @param {git.Repository} repository
     * @description pushes a Repository to a given Remote
     */
    pushTemplateRepository: function (urlToRemote, repository) {
        return push.pushTemplateRepo(urlToRemote, repository);
    },

    /**
     * @param {string} urlToRemote
     * git-link to the Remote
     * @returns {Promise<git.Repository>}
     */
    cloneTemplateRepository: function (urlToRemote) {
        return handler.initTempRepositoryRemote("", urlToRemote)
    },

    /**
     * @param {string} pathToFolder
     * the path as String
     * @param {string} urlToRemote
     * git-link to the Remote
     * @return {Promise<git.Repository>}
     */
    cloneRepositoryToFolder: function (pathToFolder, urlToRemote) {
        return handler.initTempRepositoryRemote(pathToFolder, urlToRemote);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @return {Promise<*>}
     */
    deleteRepository: function (repoName, projectName) {
        return del.deleteRepo(repoName, projectName);
    },

    /**
     * @param {string} userName
     */
    setNewUserName: function (userName) {
        return auth.setUsername(userName);
    },

    /**
     * @param {string} password
     */
    setNewPassword: function (password) {
        return auth.setPassword(password);
    },

    /**
     * @param {string} userName
     * @param {string} passWord
     * @return {Promise<number>}
     * the server-response-code
     */
    checkLoginCredentials: function (userName, passWord) {
        return get.checkLogin(userName, passWord);
    },

    /**
     * @description empties the login.cred file
     */
    deleteCredentials: function () {
        return auth.delete();
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @return {Promise<number>}
     * the server-response-code
     */
    checkRepositoryExistence: function (repoName, projectName) {
        return get.checkRepository(repoName, projectName);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectName]
     * @default PUVS
     * @return {Promise<boolean>}
     * true if any Repository in the project starts with the given Name and is not larger than repoName + 2
     */
    checkRepositoriesExistence: async function(repoName, projectName) {
        let r = await get.allRepositories(projectName);
        for (let i = 0; i < r.values.length; i++) {
            if (r.values[i].name.toString().startsWith(repoName) && r.values[i].name.length <= repoName.length + 2) {
                return true;
            }
        }
        return false;
    }
}