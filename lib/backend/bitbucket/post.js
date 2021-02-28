const stash = require("stash-client");
let auth = require("../bitbucket/auth");
const project = "PUVS";

module.exports = {

    /**
     * @param {string} repoName
     * @param {boolean} [isPublic]
     * @default false
     * @param {string} [projectKey]
     * @default PUVS
     * @return {Promise<*>}
     * the server-response
     * @description creates a Repository on the Bitbucket-server with the repoName and, if set, with public access
     */
    createRepo: async function (repoName, isPublic = false, projectKey = project) {
        const values = {
            name: repoName,
            public: isPublic
        };
        return stash(auth.getCredentials()).api().projects().repos(projectKey).create(values);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectKey]
     * @default PUVS
     * @param {string} userName
     * @param {string} [permission]
     * @default REPO_WRITE
     * @returns {Promise<*>}
     * the server-response
     * @description gives a User write access to a Repository
     */
    addUserToRepo: async function (repoName, userName, permission = "REPO_WRITE", projectKey = project) {
        const values = {
            name: userName,
            permission: permission
        }
        return stash(auth.getCredentials()).api().projects().repos(projectKey).permissions(repoName).users().update(values);
    }
}