const Configstore = require('conf');
const crypto = require("crypto");

/***********************************************************************************************************************
 *                                                   CRYPTO CONTENT                                                    *
 /*********************************************************************************************************************/

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);
const fileKey = "b92QmxMsrxBZq3Q3XgeTOE01m3BN";
const openCred = {
    username: "NOTHING",
    password: "NOTHING"
};

/**
 * @class Auth
 */
class Auth {

    constructor() {
        this.credentials = new Configstore({
            configName: "login",
            encryptionKey: fileKey,
            fileExtension: "cred"
        });
        this.url = "https://bitbucket.student.fiw.fhws.de:8443"
        this.type = "basic"
        this.username = this.decrypt(this.credentials.get("username"))
        this.password = this.decrypt(this.credentials.get("password"))
    };

    /**
     * @return {string}
     * the type if it is set, the username otherwise
     */
    getType() {
        if (this.type != null) {
            return this.type;
        } else {
            this.type = this.credentials.get("type")
            this.getUsername();
        }
    };

    /**
     * @returns {string}
     * the username
     */
    getUsername() {
        if (this.username != null) {
            return this.username;
        } else {
            this.username = this.decrypt(this.credentials.get("username"))
            if (this.username != null)
                this.getUsername();
        }
    };

    /**
     * @returns {string}
     * the password
     */
    getPassword() {
        if (this.password != null) {
            return this.password;
        } else {
            this.password = this.decrypt(this.credentials.get("password"))
            this.getPassword();
        }
    };

    /**
     * @returns {string}
     * the url
     */
    getURL() {
        if (this.isSame("url", this.url)) {
            return this.url;
        } else {
            return this.credentials.get("url");
        }
    };

    /**
     * @returns Complete Config Json with encrypted USERNAME&PASSWORD
     */
    getCredentials() {
        if (openCred.username === "NOTHING" || openCred.password === "NOTHING") {
            this.openCreds = {
                url: this.getURL(),
                type: this.getType(),
                username: this.getUsername(),
                password: this.getPassword(),
            }
        }
        return this.openCreds;
    };

    /**
     * @param {string} username
     * @param {string} password
     * @description initialize the config file in system folder
     */
    initialized(username, password) {
        this.credentials.set("url", this.url);
        this.credentials.set('username', this.encrypt(username));
        this.credentials.set("password", this.encrypt(password));
    };

    /**
     * @param {string} key
     * @return {boolean}
     * true if the key is set in the config file
     */
    exists(key) {
        return this.credentials.has(key);
    };

    /**
     * @param {string} keyInFile
     * @param {string} valueInObject
     * @return {boolean}
     * true if they are equal
     * @description checks if the key-value exists in the file and checks if it matches the key value in the program
     */
    isSame(keyInFile, valueInObject) {
        if (this.exists(keyInFile)) {
            return (this.credentials.get(keyInFile) === valueInObject);
        }
    };

    /**
     * @return {boolean}
     * true if the credentials have been loaded from the file into the program
     */
    existsCredentials() {
        return (this.credentials.has('password') && this.credentials.has('username') && this.credentials.has('url'));
    };

    /**
     * @description resets the loaded config
     */
    resetAll() {
        this.credentials.clear();
    };

    /**
     * @param {string} password
     * @description sets a new password
     */
    setPassword(password) {
        this.password = password;
    };

    /**
     * @param {string} username
     * @description sets a new username
     */
    setUsername(username) {
        this.username = username;
    };

    /*******************************************************************************************************************
     *                                     MAGIC CRYPTO PART                                                           *
     ******************************************************************************************************************/

    encrypt = (text) => {
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    };

    decrypt = (hash) => {
        if (this.existsCredentials()) {
            const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
            const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
            return decrypted.toString();
        }
    };
}

module.exports = Auth;