class Readme {
    /**
     * @param {string} repoName
     * @param {string} abgabe
     * @param {boolean} dokumentation
     * @param {boolean} praesentation
     * @param {boolean} commithistory
     * @param {boolean} kolloquium
     * @param {string} veroeffentlichungNote
     * @param {string} muendlichePruefungen
     * @param {Termin[]} termine
     * @param {Thema[]} themen
     * @constructor
     */
    constructor(
        repoName,   //string
        abgabe,     //string -> date ("01.01.2000 10.00")
        dokumentation,  //boolean
        praesentation,  //boolean
        commithistory,  //boolean
        kolloquium,     //boolean
        veroeffentlichungNote,  //string ("Ende August bzw. Anfang September")
        muendlichePruefungen,   //string -> date ("01.01.2000 10.00")
        termine,    // array[] von TerminObjects
        themen  // array[] von Pruefungsthema-Objects
    ) {

        this.repoName = repoName;
        this.abgabe = abgabe;
        this.dokumentation = dokumentation;
        this.praesentation = praesentation;
        this.commithistory = commithistory;
        this.kolloquium = kolloquium;
        this.veroeffentlichungNote = veroeffentlichungNote;
        this.muendlichePruefungen = muendlichePruefungen;
        this.termine = termine;
        this.themen = themen;
    }
}

module.exports = Readme;
