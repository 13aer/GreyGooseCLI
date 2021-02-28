class TeamHandler {
    /**
     * @param {Team[]} teams
     * @constructor
     */
    constructor(teams) {
        this._Teams = teams;
    }

    /**
     * @param {number} TeamId
     * @return {Team|number}
     * the Team for the given ID or -1 if it doesnt exist
     */
    get(TeamId) {
        let index = this.getIndex(TeamId)
        return (index === -1) ? -1 : this._Teams[index];
    }

    /**
     * @param {number} TeamId
     * @return {number}
     * the index of the Team, or -1 if there is no such Element
     */
    getIndex(TeamId) {
        for (let i = 0; i < this._Teams.length; i++) {
            if (this._Teams[i].id == TeamId) return i;
        }
        return -1;
    }

    /**
     * @return {Team[]}
     * all Teams as Array
     */
    getAll() {
        return this._Teams;
    }

    /**
     * @return {Team[]}
     * all Teams without an Assignment
     */
    getAllWithoutAssignment() {
        let result = this.getAll();
        for (let i = 0; i < result.length; i++) {
            if (result[i].themaID !== -1) {
                result.splice(i, 1);
                i--;
            }
        }
        return result;
    }

    /**
     * @param {number} size
     * the size of the Team, must be integer > 0
     * @return {Team[]}
     * the Teams with the given Size as Array
     */
    getAllWithSize(size) {
        let result = this.getAll();
        for (let i = 0; i < result.length; i++) {
            if (result[i].studenten.length !== size) {
                result.splice(i, 1);
                i--;
            }
        }
        return result;
    }

    /**
     * @param {Team} Team
     * the Team to add
     * @return {TeamHandler}
     * this fo method chaining
     */
    add(Team) {
        if (this.getIndex(Team.id) === -1) this._Teams.push(Team);
        return this;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the Student
     * @return {number}
     * the index of the Team for the given Student, or -1 if there is no such Element
     */
    getIndexForStudent(mNumber) {
        for (let i = 0; i < this._Teams.length; i++) {
            let students = this.getStudents(i);
            for (let j = 0; j < students.length; j++) {
                if (students[j] == mNumber) return i;
            }
        }
        return -1;
    }

    /**
     * @param {number} index
     * @return {number[]}
     * the Student-Array in the given Team-Object
     */
    getStudents(index) {
        return this._Teams[index].studenten;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the Student which will be removed
     * @return {TeamHandler}
     * this for method chaining
     * @description removes a Student from a Team, if the Team will be empty afterwards also deletes the Team
     */
    deleteStudent(mNumber) {
        let index = this.getIndexForStudent(mNumber);
        if (index !== -1) {
            let students = this.getStudents(index);
            students.splice(students.indexOf(mNumber), 1);
            students.length === 0 ?
                this._Teams.splice(index, 1) :
                this._Teams[index].studenten = students;
        }
        return this;
    }

    /**
     * @param {number} mNumberToRemove
     * the Matrikelnummer of the Student which will be removed
     * @param {number} mNumberToAdd
     * the Matrikelnummer of the Student which will be added
     * @return {TeamHandler}
     * this for method chaining
     * @description replaces a Student in a Team-Object
     */
    replaceStudent(mNumberToRemove, mNumberToAdd) {
        let index = this.getIndexForStudent(mNumberToRemove);
        if (index !== -1) {
            this._Teams[index].studenten.splice(this._Teams[index].studenten.indexOf(mNumberToRemove), 1);
            this._Teams[index].studenten.push(mNumberToAdd);
        }
        return this;
    }

    /**
     * @param {number} assignmentId
     * the ID of the Assignment
     * @return {number}
     * the ID of the Team related to the given AssignmentID if existing, -1 otherwise
     */
    getIdForAssignment(assignmentId) {
        for (let i = 0; i < this._Teams.length; i++) {
            if (this._Teams[i].themaID == assignmentId) return this._Teams[i].id;
        }
        return -1;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the Student
     * @return {number}
     * the ID of the Team with the given Student
     */
    getIdForStudent(mNumber) {
        return this._Teams[this.getIndexForStudent(mNumber)].id;
    }

    /**
     * @param {number} assignmentId
     * the ID of the Assignment related to the Repository
     * @param {string} repoSlug
     * the slug for the Repository
     * @return {TeamHandler}
     * this for method chaining
     * @description adds the Repository to the Team
     */
    addRepositorySlug(assignmentId, repoSlug) {
        this._Teams[this.getIndex(this.getIdForAssignment(assignmentId))].repository = repoSlug;
        return this;
    }

    /**
     * @param {number} id
     * the ID for the Team
     * @return {string|number}
     * the slug of the Repository
     */
    getRepositorySlugForTeam(id) {
        return this._Teams[this.getIndex(id)].repository;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the Student-Object
     * @return {string|number}
     * the slug of the Repository related to the given Student
     */
    getRepositorySlugForStudent(mNumber) {
        return this._Teams[this.getIndexForStudent(mNumber)].repository;
    }

    /**
     * @param {number} id
     * the ID of the Team-Object
     * @param {number} mNumber
     * the Matrikelnummer of the Student to be added
     * @return {TeamHandler}
     * this for method chaining
     * @description adds a Student to a Team-Object
     */
    addStudent(id, mNumber) {
        if (this._Teams[this.getIndex(id)].studenten.indexOf(mNumber) === -1)
            this._Teams[this.getIndex(id)].studenten.push(mNumber);
        return this;
    }

    /**
     * @param {number} id
     * the ID of the Team-Object
     * @param {number} assignmentId
     * the ID of the Assignment-Object
     * @return {TeamHandler}
     * this for method chaining
     * @description adds an Assignment to a Team
     */
    addAssignment(id, assignmentId) {
        this._Teams[this.getIndex(id)].themaID = assignmentId;
        return this;
    }

    /**
     * @param {number} id
     * @return {boolean}
     */
    checkInitialized(id) {
        let ret = this._Teams[this.getIndex(id)].initialized
        return (ret === undefined) ? false : ret;
    }

    /**
     * @param {number} id
     * @description sets the Flag for the Team to true
     */
    setInitialized(id) {
        this._Teams[this.getIndex(id)].initialized = true;
    }
}

module.exports = TeamHandler;