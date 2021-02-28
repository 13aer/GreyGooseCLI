const Credentials = require('../auth/credentials')
let cred = new Credentials();

/**
 *
 * @type {{password: *, type: string, url: (string), username: *}}
 * DO NOT CHANGE IT
 * function to call decrypted USERNAME,PASSWORD,URL from local SYSTEM:DIR
 *
 */

module.exports = {

    cred: cred,

    getCredentials: function () {
        if (this.cred.existsCredentials()) {
            return this.cred.getCredentials();
        } else {
            return {
                url: "https://bitbucket.student.fiw.fhws.de:8443",
                type: "basic",
                username: "NOTHING",
                password: "NOTHING"
            }
        }
    },

    /**
     * @param {string} username
     * @description sets a new username
     */
    setUsername: function (username) {
        cred.setUsername(username)
    },

    /**
     * @param {string} password
     * @description sets a new password
     */
    setPassword: function (password) {
        cred.setPassword(password)
    },

    /**
     * @description initializes the authentication
     */
    initialize: function () {
        cred.initialized(this.cred.getUsername(), this.cred.getPassword())
    },

    /**
     * @return {boolean}
     * true if the authentication has been initialized
     */
    exists: function () {
        return this.cred.existsCredentials();
    },

    /**
     * @description resets the username and password
     */
    reset: function () {
        this.setUsername('NOTHING');
        this.setPassword('NOTHING');
    },

    /**
     * @description resets the complete authentication
     */
    delete: function () {
        this.cred.resetAll()
    }
}