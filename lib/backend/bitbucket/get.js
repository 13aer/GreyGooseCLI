const stash = require("stash-client");
const auth = require("../bitbucket/auth");
const project = "PUVS";

module.exports = {

    /**
     * @param {string} projectKey
     * @return {Repository[]}
     * the server-response-body
     */
    allRepositories: async function (projectKey = project) {
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get();
        return r.body;
    },

    /**
     * @param {string} [projectKey]
     * @default PUVS
     * @param {string} repositoryKey
     * @return {Repository}
     * the server-response-body
     */
    oneRepository: async function (repositoryKey, projectKey = project) {
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get(repositoryKey);
        return r.body;
    },

    /**
     * @param {string} repositoryKey
     * @param {string} [projectKey]
     * @default PUVS
     * @return {string}
     * the Repository-Git-Link
     */
    repositoryGitLink: async function (repositoryKey, projectKey = project) {
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get(repositoryKey);
        return (r.body.links.clone[1].name === "http") ? r.body.links.clone[1].href.toString() : r.body.links.clone[0].href.toString();
    },

    /**
     * @param {string} repositoryKey
     * @param {string} [projectKey]
     * @default PUVS
     * @return {string}
     * the Repository-Browse-Link
     */
    repositoryBrowseLink: async function (repositoryKey, projectKey = project) {
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get(repositoryKey);
        return r.body.links.self[0].href.toString();
    },

    /**
     * @param {string} repositoryLink
     * @param {string} [projectKey]
     * @default PUVS
     * @return {Promise<boolean>}
     * @description checks if a provided repositoryLink leads to a existing Repository
     */
    checkRepositoryLink: async function (repositoryLink, projectKey = project) {
        let start = repositoryLink.lastIndexOf("/") + 1;
        let end = repositoryLink.lastIndexOf(".");
        let name = repositoryLink.slice(start, end);
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get(name);
        if (r.statusCode !== 200) return false;
        return (repositoryLink === (r.body.links.clone[1].name === "http") ? r.body.links.clone[1].href.toString() : r.body.links.clone[0].href.toString());
    },

    /**
     * @return {Project[]}
     * the server-response-body
     */
    allProjects: async function () {
        let p = await stash(auth.getCredentials()).api().projects().get();
        return p.body;
    },

    /**
     * @param {string} projectKey
     * @default PUVS
     * @return {Project}
     * the server-response-body
     */
    oneProject: async function (projectKey = project) {
        let p = await stash(auth.getCredentials()).api().projects().get(projectKey);
        return p.body;
    },

    /**
     * @return {User[]}
     * the server-response-body
     */
    allUsers: async function () {
        let u = await stash(auth.getCredentials()).api().users().get();
        return u.body;
    },

    /**
     * @param {string} userKey
     * @return {User}
     * the server-response-body
     */
    oneUser: async function (userKey) {
        let u = await stash(auth.getCredentials()).api().users().get(userKey);
        return u.body;
    },

    /**
     * @return {User}
     * the current User
     */
    currentUser: async function () {
        let u = await stash(auth.getCredentials()).api().users().get(auth.getCredentials().username);
        return u.body;
    },

    /**
     * @param {string} username
     * @param {string} password
     * @return {Promise<number>}
     * the server-response-code
     */
    checkLogin: async function (username, password) {
        let login = {
            url: "https://bitbucket.student.fiw.fhws.de:8443",
            type: "basic",
            username: username,
            password: password
        }
        let r = await stash(login).api().users().get(username);
        return r.statusCode;
    },

    /**
     * @param {string} repository
     * @param {string} [projectKey]
     * @default PUVS
     * @return {Promise<number>}
     * the server-response-code
     */
    checkRepository: async function (repository, projectKey = project) {
        let r = await stash(auth.getCredentials()).api().projects().repos(projectKey).get(repository);
        return r.statusCode;
    }
}