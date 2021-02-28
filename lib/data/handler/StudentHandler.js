class StudentHandler {
    /**
     * @param {Student[]} students
     * @constructor
     */
    constructor(students) {
        this._Students = students;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the desired Student-Object
     * @return {Student}
     * the Student-Object for the given mNumber
     */
    get(mNumber) {
        for (let i = 0; i < this._Students.length; i++) {
            if (this._Students[i].matrikelnummer == mNumber) return this._Students[i];
        }
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the desired Student-Object
     * @return {string}
     * the kNumber of the Student-Object for the given mNumber
     */
    getName(mNumber) {
        return this.get(mNumber).knummer;
    }

    /**
     * @return {Student[]}
     * all Student-Objects as Array
     */
    getAll() {
        return this._Students;
    }

    /**
     * @param {number} mNumber
     * the Matrikelnummer of the Student-Object
     * @return {StudentHandler}
     * this for method chaining
     * @description deletes the Student-Object for the given mNumber
     */
    delete(mNumber) {
        for (let i = 0; i < this._Students.length; i++) {
            if (this._Students[i].matrikelnummer == mNumber) {
                this._Students.splice(i, 1);
                return this;
            }
        }
        return this;
    }

    /**
     * @param {Student} studentObj
     * @return {StudentHandler}
     * this for method chaining
     * @description adds a new Student-Object to the Students-Array, if not already existing
     */
    add(studentObj) {
        if (this._Students.indexOf(studentObj) === -1) this._Students.push(studentObj);
        return this;
    }
}

module.exports = StudentHandler;