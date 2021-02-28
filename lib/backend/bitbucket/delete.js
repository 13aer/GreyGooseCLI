const stash = require("stash-client");
const auth = require("../bitbucket/auth");
const project = "PUVS";

module.exports = {

    /**
     * @param {string} repoName
     * @param {string} [projectKey]
     * @default PUVS
     * @param {string} userName
     * @returns {Promise<*>}
     * the server response
     */
    deleteUserFromRepo: async function (repoName, userName, projectKey = project) {
        const values = {
            name: userName
        }
        return stash(auth.getCredentials()).api().projects().repos(projectKey).permissions(repoName).users().delete(values);
    },

    /**
     * @param {string} repoName
     * @param {string} [projectKey]
     * @default PUVS
     * @return {Promise<*>}
     * the server response
     */
    deleteRepo: async function (repoName, projectKey = project) {
        return stash(auth.getCredentials()).api().projects().repos(projectKey).delete(repoName);
    }
}