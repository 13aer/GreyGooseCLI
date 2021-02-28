class AssignmentHandler {
    /**
     * @param {Thema[]} assignments
     * @constructor
     */
    constructor(assignments) {
        this._Assignments = assignments;
    }

    /**
     * @param {number} AssignmentId
     * @return {Thema}
     * the Assignment for the given ID
     */
    get(AssignmentId) {
        return this._Assignments[this.getIndex(AssignmentId)];
    }

    /**
     * @param {number} AssignmentId
     * @return {number}
     * the Index of the Assignment, or -1 if there is no such Element
     */
    getIndex(AssignmentId) {
        for (let i = 0; i < this._Assignments.length; i++) {
            if (this._Assignments[i].id == AssignmentId) return i;
        }
        return -1;
    }

    /**
     * @return {Thema[]}
     * all Assignments as Array
     */
    getAll() {
        return this._Assignments;
    }

    /**
     * @param {number} AssignmentId
     * the ID of the desired Assignment
     * @param {string|number} link
     * the Browse-Link of the Repository related to the Assignment
     * @return {AssignmentHandler}
     * this for method chaining
     */
    setRepository(AssignmentId, link) {
        this._Assignments[this.getIndex(AssignmentId)].link = link;
        return this;
    }

    /**
     * @param {number} size
     * the "umfang" of the assignments
     * @return {Thema[]}
     * all Assignments with the given size
     */
    getWithSize(size) {
        let assignments = [];
        for (let i = 0; i < this._Assignments.length; i++) {
            if (this._Assignments[i].umfang == size) assignments.push(this._Assignments[i]);
        }
        return assignments;
    }
}

module.exports = AssignmentHandler;