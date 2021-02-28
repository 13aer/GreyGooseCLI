const fse = require("fs-extra");
const path = require("path");
const git = require("nodegit");
let auth = require("../bitbucket/auth");

let user = -1;

module.exports = {

    /**
     * @returns {git.Signature}
     * @description convenience function to get the signature for pushes/commits, only makes an api call on first use
     */
    getSignature: async function () {
        if (user === -1) user = await require("../bitbucket/get").currentUser();
        let userName = user.name, emailAddress = user.emailAddress;
        return git.Signature.now(userName, emailAddress);
    },

    /**
     * @param {string} [pathToRepository]
     * @default Temp-Repository
     * If empty, temp repo will be created and used
     * @returns {Promise<git.Repository>}
     * @description initiates a git Repository
     */
    initTempRepository: function (pathToRepository) {
        if (pathToRepository === undefined || pathToRepository === "") {
            pathToRepository = path.resolve(__dirname, "./temp");
            return fse.remove(path.resolve(__dirname, pathToRepository))
                .then(function () {
                    return fse.ensureDir(path.resolve(__dirname, pathToRepository));
                })
                .then(function () {
                    return git.Repository.init(path.resolve(__dirname, pathToRepository), 0);
                });
        } else {
            return git.Repository.init(path.resolve(__dirname, pathToRepository), 0);
        }
    },

    /**
     * @param {string} [pathToRepository]
     * @default Temp-Repository
     * If empty, temp repo will be created and used
     * @param {string} urlToRemote
     * git-link to the Remote
     * @returns {Promise<git.Repository>}
     */
    initTempRepositoryRemote: async function (pathToRepository, urlToRemote) {
        if (pathToRepository === undefined || pathToRepository === "") {
            pathToRepository = path.resolve(__dirname, "./temp");
            return fse.remove(path.resolve(__dirname, pathToRepository))
                .then(function () {
                    return fse.ensureDir(path.resolve(__dirname, pathToRepository));
                })
                .then(function () {
                    return git.Clone.clone(urlToRemote, path.resolve(__dirname, pathToRepository), {
                        fetchOpts: {
                            callbacks: {
                                credentials: function () {
                                    return git.Cred.userpassPlaintextNew(auth.getCredentials().username, auth.getCredentials().password);
                                }
                            }
                        }
                    });
                });
        } else {
            return git.Clone.clone(urlToRemote, path.resolve(__dirname, pathToRepository), {
                fetchOpts: {
                    callbacks: {
                        credentials: function () {
                            return git.Cred.userpassPlaintextNew(auth.getCredentials().username, auth.getCredentials().password);
                        }
                    }
                }
            });
        }
    },

    /**
     * @description convenience function to delete temp repo, if it exists
     */
    clearTempRepo: function () {
        fse.pathExists(path.resolve(__dirname, "./temp")).then(function (e) {
            if (e) return fse.remove(path.resolve(__dirname, "./temp"))
        })
    }
}