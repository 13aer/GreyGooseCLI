let auth = require("../bitbucket/auth");
const path = require("path");
const git = require("nodegit");
const fse = require("fs-extra");
const repo = require("../handler/repository");

module.exports = {

    /**
     * @param {string} urlToRemote
     * @param {string} fileContent
     * @param {string} [commitMessage]
     * @default adding/updating files
     * @param {string} [pathToRepo]
     * @default uses TempRepo
     * @description Clones repository from remote, overwrites README.md and pushes back on remote
     */
    updateReadme: async function (urlToRemote, fileContent, commitMessage = "adding/updating files", pathToRepo = "") {
        let fileName = "README.md", repository, tree;
        let signature = await repo.getSignature();

        repo.initTempRepositoryRemote(pathToRepo, urlToRemote)
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
                tree = oid;
                return git.Reference.nameToId(repository, "HEAD");
            })
            .then(function (head) {
                return repository.getCommit(head);
            })
            .then(function (parent) {
                return repository.createCommit("HEAD", signature, signature,
                    commitMessage, tree, [parent]);
            })
            .then(function () {
                return repository.getRemote("origin")
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
    }
}