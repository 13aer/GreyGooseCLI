let auth = require("../bitbucket/auth");
const path = require("path");
const git = require("nodegit");
const fse = require("fs-extra");
const repositoryHandler = require("../handler/repository");

module.exports = {

    /**
     * @param {string} urlToRemote
     * @param {string} [fileContent]
     * @param {string} [commitMessage]
     * @default initial commit
     * @param {string} [pathToRepo]
     * @default creates TempRepo
     * @description Copies fileContent into (Temporary) README.md-file and pushes to remote
     */
    pushReadme: async function (urlToRemote, fileContent = "", commitMessage = "initial commit", pathToRepo = "") {
        let fileName = "README.md", repository;
        let signature = await repositoryHandler.getSignature();

        repositoryHandler.initTempRepository(pathToRepo)
            .then(function (repo) {
                repository = repo;
                return fse.writeFile(path.join(repository.workdir(), fileName), fileContent);
            })
            .then(function () {
                return repository.refreshIndex();
            })
            .then(function (index) {
                return index.addByPath(fileName)
                    .then(function () {
                        return index.write();
                    })
                    .then(function () {
                        return index.writeTree();
                    });
            })
            .then(function (oid) {
                return repository.createCommit("HEAD", signature, signature,
                    commitMessage, oid, []);
            })
            .then(function () {
                return git.Remote.create(repository, "origin",
                    urlToRemote)
                    .then(function (remote) {
                        return remote.push(
                            ["refs/heads/master:refs/heads/master"],
                            {
                                callbacks: {
                                    credentials: function () {
                                        return git.Cred.userpassPlaintextNew(auth.getCredentials().username, auth.getCredentials().password);
                                    }
                                }
                            }
                        );
                    });
            });
    },

    /**
     * @param {string} urlToRemote
     * the git-Link to the Repository
     * @param {git.Repository} repository
     * @description pushes a Repository to a given Remote
     */
    pushTemplateRepo: async function (urlToRemote, repository) {
        git.Remote.delete(repository, "origin").then(function () {
            git.Remote.create(repository, "origin",
                urlToRemote)
                .then(function (remote) {
                    return remote.push(
                        ["refs/heads/master:refs/heads/master"],
                        {
                            callbacks: {
                                credentials: function () {
                                    return git.Cred.userpassPlaintextNew(auth.getCredentials().username, auth.getCredentials().password);
                                }
                            }
                        }
                    );
                });
        })
    }
}