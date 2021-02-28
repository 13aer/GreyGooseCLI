const Conf = require("conf")
const structure = require("../structure/Structure");
const studentHandler = require("./StudentHandler");
const assignmentHandler = require("./AssignmentHandler")
const teamHandler = require("./TeamHandler")

class SaveFileHandler {
    /**
     * @param {string} name
     * the name of the file to load/create
     * @constructor
     */
    constructor(name) {
        this.file = new Conf({
            configName: name
        });
        this.loadAll();
    }

    /**
     * @return {Conf<Record<string, unknown>>}
     * @constructor
     */
    get File() {
        return this.file;
    }

    /**
     * @return {StudentHandler}
     * @constructor
     */
    get Students() {
        return this._Students;
    }

    /**
     * @return {TeamHandler}
     * @constructor
     */
    get Teams() {
        return this._Teams;
    }

    /**
     * @return {AssignmentHandler}
     * @constructor
     */
    get Assignments() {
        return this._Assignments;
    }

    /**
     * @return {Structure}
     * @constructor
     */
    get Structure() {
        return (this.file.has("Repository")) ? this.file.get("Repository") : new structure();
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes all Objects into the file
     */
    saveAll() {
        this.saveStudents()
            .saveTeams()
            .saveAssignments();
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes Students-Object into the file
     */
    saveStudents() {
        this.file.set("Repository.studenten", this._Students.getAll());
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes Teams-Object into the file
     */
    saveTeams() {
        this.file.set("Repository.teams", this._Teams.getAll());
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes Assignments-Object into the file
     */
    saveAssignments() {
        this.file.set("Repository.readme.themen", this._Assignments.getAll());
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description loads all Objects from the file
     */
    loadAll() {
        this.loadStudents()
            .loadTeams()
            .loadAssignments();
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description loads Students-Objects from the file
     */
    loadStudents() {
        this._Students = new studentHandler(this.file.get("Repository.studenten", []));
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description loads Teams-Objects from the file
     */
    loadTeams() {
        this._Teams = new teamHandler(this.file.get("Repository.teams", []));
        return this;
    }

    /**
     * @return {SaveFileHandler}
     * this for method chaining
     * @description loads Assignments-Objects from the file
     */
    loadAssignments() {
        this._Assignments = new assignmentHandler(this.file.get("Repository.readme.themen", []));
        return this;
    }

    /**
     * @param {Structure} structure
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes new structure Object into the file, overwrites old file completely
     */
    overWriteAll(structure) {
        this.file.set("Repository", structure);
        return this;
    }

    /**
     * @param {Student[]} students
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes new Students-Objects into the file, overwrites old Students in file completely
     */
    overWriteStudents(students) {
        this.file.set("Repository.studenten", students);
        return this;
    }

    /**
     * @param {Team[]} teams
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes new Teams-Objects into the file, overwrites old Teams in file completely
     */
    overWriteTeams(teams) {
        this.file.set("Repository.teams", teams);
        return this;
    }

    /**
     * @param {Thema[]} assignments
     * @return {SaveFileHandler}
     * this for method chaining
     * @description writes new Assignments-Objects into the file, overwrites old Assignments in file completely
     */
    overWriteAssignments(assignments) {
        this.file.set("Repository.readme.themen", assignments);
        return this;
    }
}

module.exports = SaveFileHandler;