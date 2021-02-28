module.exports = {

    name(name) {
        return validateName(name)
    },
    datetime(datetime) {
        return validateDateTime(datetime)
    },
    date(date) {
        return validateDate(date)
    },
    time(time) {
        return validateTime(time)
    },
    scope(str) {
        return validateScope(str);
    },
    matrikel(matrikelnummer) {
        return validateMatrikelnummer(matrikelnummer)
    },
    kNummer(kNummer) {
        return validateKNummer(kNummer)
    },
    templateName(vorlage) {
        return validateTemplateName(vorlage);
    },
    templateURL(url) {
        return validateTemplateURL(url);
    },
}

/**
 * @name validateName
 * @type {function()}
 *
 * @description Serves to validate a name for the Repository entered by the user
 * @description A valid Name must not contain any special signs except for spaces
 *
 * @param name
 * @example Practical Exam Summer Semester 2021
 *
 * @returns {string|boolean} Error message if name is not in correct format and true if it is valid
 */
function validateName(name) {
    if (!/^[a-zA-Z0-9]+$/.test(name.replace(/ /g, ''))) return 'Name darf nur Buchstaben (keine Umlaute), Ziffern und Leerzeichen enthalten.';
    return true;
}

/**
 * @name validateDateTime
 * @type {function()}
 *
 * @description Serves to validate a datetime entered by the user
 * @description Mainly used for **Abgabe** and **mündliche Prüfungen** in the README
 *
 * @param datetime string: DD.MM.YYYY HH.MM
 * @example 01.10.2021 09.00
 *
 * @returns {string|boolean} Error message if datetime is not in correct format and true if it is valid
 */
function validateDateTime(datetime) {
    let msg = 'Ungültiges Format. Geben Sie das Datum und die Uhrzeit bitte wie folgt an:\n DD.MM.YYYY HH.MM';
    if (!datetime.includes(' ') || !datetime.includes('.')) return msg;

    let date = datetime.split(' ')[0]
    let time = datetime.split(' ')[1]
    let day = date.split('.')[0]
    let month = date.split('.')[1]
    let year = date.split('.')[2]
    let hour = time.split('.')[0]
    let min = time.split('.')[1]

    let values = [day, month, year, hour, min];

    for (let val of values) {
        if (val === 'undefined') return msg;
        if (!(/^\d+$/.test(val))) return msg;
        if (day < 1 || day > 31 || month < 1 || month > 12) return 'Das ist kein gültiges Datum!';
        if (hour < 0 || hour > 24 || min < 0 || min > 59) return 'Das ist keine gültige Uhrzeit!';
    }

    if (day.length !== 2 || month.length !== 2) return 'Geben Sie Tag und Monat mit führender 0 an (wenn < 10)';
    if (year.length !== 4) return 'Geben Sie das volle Jahr an: YYYY';
    if (hour.length !== 2 || min.length !== 2) return 'Geben Sie die Urzeit mit führender Null an: 09.00';

    return true;
}

/**
 * @name validateDate
 * @type {function()}
 *
 * @description Serves to validate a date entered by the user
 * @description Mainly used to validate **appointments**
 *
 * @param date string DD.MM.YYYY
 * @example 01.12.2021
 *
 * @returns {string|boolean} Error message if date is not in correct format and true if it is valid
 */
function validateDate(date) {

    if (date === '' || date === 'TBD' || date === 'undefined') return true;

    let msg = 'Ungültiges Format. Geben Sie das Datum bitte wie folgt an:\n DD.MM.YYYY';

    if (!date.includes('.')) return msg;

    let day = date.split('.')[0]
    let month = date.split('.')[1]
    let year = date.split('.')[2]

    let values = [day, month, year];

    for (let val of values) {
        if (val === 'undefined') return msg;
        if (!(/^\d+$/.test(val))) return msg;
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 0 || year > 3000) return 'Das ist kein gültiges Datum!';
        if (day.length !== 2 || month.length !== 2) return 'Geben Sie Tag und Monat mit führender 0 an (wenn < 10)';
    }
    return true;
}

/**
 * @name validateTime
 * @type {function()}
 *
 * @description Serves to validate a time entered by the user
 * @description Mainly used to validate the **time of oral exams**
 *
 * @param time string HH.MM
 * @example 09.00
 *
 * @returns {string|boolean} Error message if time is not in correct format and true if it is valid
 */
function validateTime(time) {
    let hour = time.split('.')[0]
    let min = time.split('.')[1]

    if (hour === undefined || min === undefined) {
        return 'Falsches Format. Geben Sie die Uhrzeit wie folgt an: HH.MM'
    } else if (hour.length !== 2 || min.length !== 2) {
        return 'Geben Sie führende Nullen an, z.B. 09.00'
    } else if (!/^\d+$/.test(hour) || !/^\d+$/.test(min)) {
        return 'Eine Uhrzeit darf nur Ziffern enthalten'
    }

    return true;
}

/**
 * @name validateScope
 * @type {function()}
 *
 * @description Serves to validate a scope entered by the user
 * @description Mainly used to validate the **scope of topics**
 *
 * @param scope string|number
 * @example 2
 *
 * @returns {string|boolean} Error message if scope is not 1 or 2 and true if it is valid
 */
function validateScope(scope) {
    if (!scope.trim()) return 'Der Umfang wird benötigt.';
    scope = parseInt(scope)
    if (isNaN(scope)) return 'Der Umfang muss eine Zahl sein.';
    if (scope < 1 || scope > 2) return 'Der Umfang kann nur 1 oder 2 sein.';
    return true;
}

/**
 * @name validateMatrikelnummer
 * @type {function()}
 *
 * @description Serves to validate a **Matrikelnummer** entered by the user
 *
 * @param matrikelnummer string 5XXXXXX
 * @example 5112233
 *
 * @returns {string|boolean} Error message if Matrikelnummer is not in correct format and true if it is valid
 */
function validateMatrikelnummer(matrikelnummer) {
    if (matrikelnummer.length !== 7) return 'Matrikelnummer ungültig. (Überprüfen Sie die Länge)';
    if (isNaN(parseInt(matrikelnummer))) return 'Die Matrikelnummer darf nur die Ziffern 0-9 enthalten.';
    return true;
}

/**
 * @name validateKNummer
 * @type {function()}
 *
 * @description Serves to validate a **k-Nummer** entered by the user
 *
 * @param kNummer string
 * @example k12345
 *
 * @returns {string|boolean} Error message if k-Nummer is not in correct format and true if it is valid
 */
function validateKNummer(kNummer) {
    if (kNummer.length !== 6) return 'k-Nummer ungültig. (Überprüfen Sie die Länge)';
    if (kNummer.charAt(0) !== 'k') return 'Geben Sie die k-Nummer mit kXXXXX an.';
    let num = kNummer.substr(1, kNummer.length)
    if (isNaN(parseInt(num))) return 'Die k-Nummer darf nach dem "k" nur die Ziffern 0-9 enthalten.';
    return true;
}

/**
 * @name validateTemplateName
 * @type {function()}
 *
 * @description Serves to validate a template name entered by the user
 * @description Used to validate the **name of the team repositories**
 *
 * @param templateName string
 * @example PVS2021Exam
 *
 * @returns {string|boolean} Error message if name is invalid and true if it is valid
 */
function validateTemplateName(templateName) {
    if (!templateName.trim()) return "Die Repositories brauchen eine Bezeichnung.";
    if (!/^[a-zA-Z0-9]+$/.test(templateName)) return "Der Name darf nur Buchstaben und Ziffern enthalten";
    return true;
}

/**
 * @name validateTemplateURL
 * @type {function()}
 *
 * @description Serves to validate a url entered by the user
 * @description Used to validate the **URL of the team repositories template structure**
 *
 * @param url string
 * @example https://bitbucket.student.fiw.fhws.de:8443/mypath.git
 *
 * @returns {string|boolean} Error message if url is invalid and true if it is valid
 */
function validateTemplateURL(url) {
    if (/\s/.test(url)) return 'Ein URL darf keine Leerzeichen enthalten';
    return true;
}
