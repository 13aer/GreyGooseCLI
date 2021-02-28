class Repository {
    constructor(
        repo,
        readme,   //string
        students
    ) {
        this.repo = repo;
        this.readme = readme;
        this.students = students;
    }

    getRepo() {
        return this.repo;
    }
}

module.exports = Repository;
