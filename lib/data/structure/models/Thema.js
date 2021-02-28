class Thema {
    /**
     * @param {number} id
     * @param {string} thema
     * @param {number} umfang
     * @param {string} beschreibung
     * @param {number|string} link
     * @param {number[]} studenten
     */
    constructor(
        id,
        thema,
        umfang,
        beschreibung,
        link,
        studenten,
    ) {
        this.id = id
        this.thema = thema
        this.umfang = umfang
        this.beschreibung = beschreibung
        this.link = link
        this.studenten = studenten
    }

    getDescription() {
        return this.id_cnt + '\t' + this.thema;
    }

    getDescriptionTeam() {
        return this.id_cnt + '\t' + this.umfang + '\t\t' + this.thema + spacing(this.thema) + this.getStudenten()
    }

    getStudenten() {
        let output = ''
        if (this.studenten.length !== 0) {
            for (let val of this.studenten) {
                output += 'M' + val + ', '
            }
        }
        return output.slice(0, -2);
    }
}

function spacing(thema) {
    let tabs = ''
    let len = thema.length
    if (len <= 15) {
        tabs = '\t\t\t\t'
    } else if (len > 15 && len <= 20) {
        tabs = '\t\t\t'
    } else if (thema <= 1) {
        tabs = '\t\t\t\t\t'
    } else {
        tabs = '\t\t'
    }
    return tabs;
}

module.exports = Thema;