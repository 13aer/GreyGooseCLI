class Structure {
    /**
     * @param {string} slug
     * @param {TeamRepo} teamRepo
     * @param {Readme} readme
     * @param {Team[]} teams
     * @param {Student[]} studenten
     * @constructor
     */
    constructor(
        slug,
        teamRepo,
        readme,
        teams,
        studenten
    ) {
        this.slug = slug;
        this.teamRepo = teamRepo;
        this.readme = readme;
        this.teams = teams;
        this.studenten = studenten;
    }
}

module.exports = Structure;