global.teamID = 0;

class Team {
    /**
     * @param {number} id
     * @param {number|string} repository
     * @param {boolean} initialized
     * @param {number} themaID
     * @param uhrzeit
     * @param status
     * @param {number[]} studenten
     */
    constructor(id, repository, initialized, themaID, uhrzeit, status, studenten) {
        this.id = id;
        this.repository = repository;
        this.initialized = initialized;
        this.themaID = themaID;
        this.uhrzeit = uhrzeit;
        this.status = status;
        this.studenten = studenten;     //array mit Matrikelnummern
    }

    getDescription() {
        return this.id + '\t' + this.thema + '\t' + this.studenten
    }
}

module.exports = Team;