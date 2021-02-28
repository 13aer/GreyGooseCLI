class TeamRepo {
    /**
     * @param {number|string} templateName
     * @param {number|string} templateUrl
     */
    constructor(templateName, templateUrl) {
        this.name = templateName;
        this.url = templateUrl;
    }
}

module.exports = TeamRepo