module.exports = {
    getSlug: function (name) {
        return getSlug(name)
    },
    getReadmeContent: function (readme, teams) {
        initialize(readme, teams);
        return createREADME();
    }
}

const dateformat = require('dateformat');

let name;
let slug;
let abgabe;
let dokumentation;
let präsentation;
let commithistory;
let kolloquium;
let veröffentlichungNote;
let mündlichePrüfungen;
let termine;
let themen;
let teams;

/**
 * @name initialize()
 * @description         Initializes the variables using the given Readme Object
 * @param readme        Readme Object
 * @param publishTeams  contains either the actual teams or an empty array, depending on the users choice of publishing/not publishing the teams
 */
function initialize(readme, publishTeams) {
    name = readme.repoName;
    slug = getSlug(name);
    abgabe = readme.abgabe;
    dokumentation = readme.dokumentation;
    präsentation = readme.praesentation;
    commithistory = readme.commithistory;
    kolloquium = readme.kolloquium;
    veröffentlichungNote = readme.veroeffentlichungNote;
    mündlichePrüfungen = readme.muendlichePruefungen;
    termine = readme.termine;
    themen = readme.themen;
    teams = publishTeams;
}

/**
 * @name createREADME()
 * @description Creates the Readme file as String by connecting each of the paragraphs
 * @returns {string}    Readme file as string
 */
function createREADME() {
    return Titel_und_Einführung() +
        Praktische_Prüfungsleistung() +
        Termine() +
        Bewertungskriterien() +
        Angemeldete_Studierende() +
        Prüfungsthemen();

}

function getSlug(repoName) {
    return repoName.replace(/ /g, '-').toLowerCase()
}



function Titel_und_Einführung() {
    return '# Parallel and Distributed Systems -- ' + name +
        '\n\n' +
        '## Einführung' +
        '\n\n' +
        'Für das Modul "Parallele und Verteilte Systeme" werden wir in diesem Semester auf eine **praktische Prüfungsleitung** wechseln, die in Teams von max. zwei Studierenden bearbeitet werden kann. Wir schätzen den Aufwand zur Bearbeitung dieser Prüfungsleistung auf ca. 30 Stunden pro Person, was nach unseren Umfrageergebnissen aus den letzten Jahren der Zeit entspricht, die Sie für die Vorbereitung auf die schriftliche Prüfung investiert hätten oder investiert haben sollen. Es besteht für die Studierenden kein Anspruch darauf, dass im kommenden Semester die gleiche Prüfungsform angewendet werden wird.' +
        '\n\n'
}

function Praktische_Prüfungsleistung() {
    let content = '## Praktische Prüfungsleistung' +
        '\n\n' +
        'Die praktische Prüfungsleistung besteht aus der Bearbeitung einer vorgegebenen Aufgabe zur Entwicklung einer Software im Rahmen der Inhalte der Vorlesung mit einem Schwerpunkt auf das Thema REST. Die Aufgabe kann alleine oder in Teams von maximal zwei Studierenden bearbeitet werden. Die Zuordnung der Aufgaben zu den Studierenden erfolgt durch ein Losverfahren. ' +
        '\n\n' +
        'Für jede Aufgabe wird ein eigenes Repository im [Bitbucket System der Fakultät Informatik und Wirtschaftsinformatik](https://bitbucket.student.fiw.fhws.de:8443) angelegt. Sobald die Aufgaben den Studierenden zugelost worden sind, werden die Repositories auch jeweils so abgesichert, dass nur die bearbeitenden Studierenden Zugriff auf das Repository der Aufgabe erhalten. ' +
        '\n\n' +
        'Die Abgabe des Ergebnisses in Form eines Repositories im [Bitbucket System der Fakultät Informatik und Wirtschaftsinformatik](https://bitbucket.student.fiw.fhws.de:8443) erfolgt bis ' + formatDateTime(abgabe) + '. Anschließend wird der schreibende Zugriff auf das Repository für die Studierenden gesperrt. Es ist ' + getEineKeinePlaceholder(dokumentation) + ' Dokumentation der Projektes oder des Quelltextes zu erstellen, und es ist ' + getEineKeinePlaceholder(präsentation) + ' Präsentation zu erstellen. Die Commit-Historie und die Qualität der Commit-Nachrichten wird ';

    if (!commithistory) {
        content += '**nicht** ';
    }

    content += 'bewertet.' +
        '\n\n'

    if (kolloquium) {
        content += 'Pro Aufgabe findet mit den beteiligten Studierenden im Prüfungszeitraum ein kurzes verpflichtendes **Kolloquium** statt, in dem von den Prüfenden Fragen zum Quelltext und zur Lösung der Aufgabe gestellt werden können. Dies dient hauptsächlich der Feststellung, ob der Quelltext selber verfasst wurde. Dieser Teil der Prüfung findet voraussichtlich in Form einer Videokonferenz über Zoom statt. Studierende, die nicht an einer Videokonferenz teilnehmen können oder wollen, erhalten Gelegenheit zum Zutritt zum Gebäude am Sanderheinrichsleitenweg 20 in Würzburg. ' +
            '\n\n'
    }
    return content
}

function Termine() {
    return '## Termine' +
        '\n\n' +
        createApptsTable() +
        '\n\n'

    /**
     * @name createApptsTable()
     * @description creates the Markdown table for the **appointments**
     * @returns {string}
     */
    function createApptsTable() {
        let sorted = sortAppts();
        let table = '| Datum      | Beschreibung |\n' +
            '| ---------- | ------------ |\n'
        for (let appt of sorted) {
            if (appt.datum !== '' && appt.datum !== 'TBD') {
                table += '| ' + dateformat(new Date(appt.datum), 'dd.mm.yyyy') + ' | ' + appt.beschreibung + ' |\n'
            } else {
                table += '| ' + 'TBD' + ' | ' + appt.beschreibung + ' |\n'
            }
        }
        return table;
    }

    /**
     * @name sortAppts()
     * @description Sorts each **Appointment** by their date
     * @description Earliest date comes first
     * @description Appointments without date (TBD) will be listed last
     * @returns {this}
     */
    function sortAppts() {
        let unsorted = [];
        let apptsTBD = [];  // to be defined // no dates

        for (let appt of termine) {
            (appt.datum !== '' && appt.datum !== 'TBD') ? unsorted.push(appt) : apptsTBD.push(appt)
        }

        let sorted = unsorted.sort(function(a,b){
            return new Date(a.datum) - new Date(b.datum);
        });
        for (let appt of apptsTBD) {
            sorted.push(appt);
        }
        return sorted;
    }
}

function Bewertungskriterien() {

    return Generelle_Rahmenbedingungen() +
        Zusammensetzung_der_Note() +
        Bewertung_des_Quelltextes() +
        Bewertung_des_Kolloquium() +
        Bildung_der_Gesamtnote() +
        Veröffentlichung_der_Endnote() +
        Einsichtname_im_kommenden_Semester();


    function Generelle_Rahmenbedingungen() {
        return '### Generelle Rahmenbedingungen' +
            '\n\n' +
            '1. Zu entwickeln ist die Software für den Server einer verteilten Client/Server Anwendung.\n' +
            '2. Die Entwicklung eines Clients (mobile oder Web-basiert) kann gerne auf freiwilliger Basis erfolgen, wird aber **nicht** bewertet. \n' +
            '3. Die Entwicklung der Software für den Server muss in Programmiersprache Java (Version 8 oder höher) und mit den in der Vorlesung gezeigten Beispielen, Frameworks und Libraries (JAX-RS, Jersey 2, Genson, JAXB, Apache Commons Projekte, OkHttp, jwt.io, usw.) erfolgen. Es ist zulässig, Code aus den in der Vorlesung benutzten Repositories zu kopieren (z.B. die Klasse Hyperlinks oder den CORS Filter). \n' +
            '4. Weitere Frameworks oder Software-Generatoren dürfen **nicht** eingesetzt werden. \n' +
            '5. Die Software muss als Maven Projekt im Repository verfügbar sein (d.h. es muss eine Datei pom.xml geben und die Verzeichnisse src, main, usw. müssen entsprechend benannt worden sein). Die Software muss auf der Kommandozeile mit dem Kommando mvn -U clean package in ein Java-Archive (JAR-Datei) übersetzt werden können. Dieses JAR Archiv muss den Tomcat-Container enthalten und mit dem Kommando java -jar JAR-FILE gestartet werden können. \n' +
            '6. Falls eine Datenbank (MySQL, Postgres, CouchDB, o.ä.) verwendet wird, muss die Anwendung in einem Docker-Container bereitgestellt werden, d.h. es muss ein Docker Compose File o.ä. im Repository enthalten sein.  \n' +
            '7. Wenn Testfälle implementiert werden, muss dafür JUnit verwendet werden. Die Auswahl der Client-Bibliothek für HTTP Anfragen ist beliebig. Die Testfälle müssen aus der IDE gegen den laufenden Server ohne Änderung des Quelltextes gestartet werden können.' +
            '\n\n'
    }

    function Zusammensetzung_der_Note() {
        return '### Zusammensetzung der Note' +
            '\n\n' +
            'Es können für die Lösung der praktischen Aufgabe und das Kolloquium insgesamt 120 Punkte erreicht werden. Die Gesamtnote für dieses Modul setzt sich zusammen aus den beiden Teilnoten für' +
            '\n\n' +
            '* Die Lösung der Programmieraufgabe in Form von Quelltext (Anteil an der Gesamtnote 75%, also 90 von 120 Punkten)\n' +
            '* Die Beantwortung der Fragen im Kolloquium (Anteil an der Gesamtnote 25%, also 30 von 120 Punkten)' +
            '\n\n'
    }

    function Bewertung_des_Quelltextes() {
        return '### Bewertung des Quelltextes\n' +
            '\n' +
            'Bei der Bewertung des Quelltextes können maximal 90 Punkte erreicht werden. \n' +
            '\n' +
            '| Kriterium         | Beschreibung | Maximale Punkte    |\n' +
            '| ----------------- | ------------ | ------------------ |\n' +
            '| Ressourcen        | Namen der Ressourcen, Attribute und deren Datentypen, Assoziationen zwischen Ressourcen, Self-Links | 10 | \n' +
            '| Design der URIs   | Korrekte Benennung der Path-Elemente. Sind maximal zwei Ebenen (primär, sekundär) verwendet worden? | 5 | \n' +
            '| Repräsentationen  | Auswahl geeigneter Repräsentationsformate | 5 (JSON **oder* XML); +5 (Bonus, mehr als ein Format) | \n' +
            '| Dispatcher        | Gibt es einen Dispatcher State mit Hyperlinks zu allen Primärressourcen? | 5 | \n' +
            '| CRUD              | Sind die CRUD Operationen und die Status-Codes korrekt umgesetzt? | 15 | \n' +
            '| Hypermedia       | Sind Hyperlinks im Response Header korrekt mit Relations-Typ?  | 15 | \n' +
            '| Paging            | Ist ein sinnvolles Paging Verfahren implementiert? Default-Werte sinnvoll? Hyperlinks auf Vorgänger- und Nachfolger-Seite gesetzt? Grenzfälle beachtet? | 5 | \n' +
            '| Filtering         | Sind sinnvolle Filter-Parameter benutzt worden? Filtern wurde in die DAOs verlagert? Gibt es Query Templates?| 5 | \n' +
            '| Authentifizierung | Korrekte Umsetzung eines Authentifizierungsverfahrens gegen eine eigene User-Datenbank; alternativ Authentifizierung gegen api.fiw.fhws.de | 10 (HTTP Basic); +5 (Bonus, Bearer mit JWT) | \n' +
            '| Caching           | Auswahl eines geeigneten Caching-Verfahrens für alle GET Zugriffe. | 5; +5 (Bonus, Conditional PUT mit ETags) | \n' +
            '| Test-Cases  | Gibt es für min. 80% der States min. einen Test-Fall mit JUnit? | 5 | \n' +
            '| Datenbanken       | Verwendung des DAO Musters, Trennung von Interfaces und Implementierung | 5 (in-memory); +5 (Bonus, externes DBMS)| \n' +
            '| Lesbarkeit des Quelltextes | Einhalten von Source Code Konventionen (Benennung, Formatierung, pro Methode nur eine Aufgabe) | +10 (Bonus) |\n' +
            '\n' +
            'Bonus bedeutet, dass für eine besonders aufwändige Lösung mehr Punkte vergeben werden, als für die vollständige Implementierung notwendig gewesen wären. Zum Beispiel reicht für die maximale Punktzahl eine Datenbankimplementierung in-memory (mit Maps) aus. Wenn aber ein externes Datenbankmanagementsystem verwendet wurde, kann man weitere 5 Punkte erhalten.\n\n'
    }

    function Bewertung_des_Kolloquium() {
        if (kolloquium) {
            return '### Bewertung des Kolloquiums\n' +
                '\n' +
                'Im Kolloquium werden ausschließlich zum eigenen Quelltext und zum Stoff der Vorlesung (aber immer mit Bezug zum Quelltext) gestellt. Die Fragen haben das Ziel zu klären, ob Sie den Quelltext selbst geschrieben und verstanden haben bzw. wir als Prüfende Ihre Entscheidungen (z.B. zur Wahl der Ressourcen-Namen, zum Caching Verfahren, zur Wahl der Status-Codes, usw.) nachvollziehen zu können. **Auch bei einer Gruppenarbeit muss jeder Studierende den gesamten Quelltext erklären können.**\n' +
                '\n' +
                '| Leistung      | Punkte    |\n' +
                '| ------------- | --------- |\n' +
                '| sehr gut      | 25 bis 30 |\n' +
                '| gut           | 20 bis 24 |\n' +
                '| befriedigend  | 15 bis 19 |\n' +
                '| ausreichend   | 10 bis 14 |\n' +
                '| mangelhaft    | 0 bis 9  |\n\n'
        } else return '';
    }

    function Bildung_der_Gesamtnote() {
        return '### Bildung der Gesamtnote\n' +
            '\n' +
            'Die Punkte für den Quelltext und die Punkte für das Kolloquium werden addiert. Ein leeres Repository am ' + formatDateTime(abgabe) + ' führt zur Gesamtnote 5,0. Nicht-Teilnahme am Kolloquium (ohne Attest) sowie Verweigerung der Beantwortung von Fragen führt zur Gesamtnote 5,0. \n' +
            '\n' +
            '| Gesamtpunktzahl        | Gesamtnote |\n' +
            '| ---------------------- | --------- |\n' +
            '| 114 bis 120            | 1,0       |\n' +
            '| 107 bis 113            | 1,7       |\n' +
            '| 100 bis 106            | 2,0       |\n' +
            '| 93 bis 99              | 2,3       |\n' +
            '| 86 bis 94              | 2,7       |\n' +
            '| 81 bis 87              | 3,0       |\n' +
            '| 74 bis 80              | 3,3       |\n' +
            '| 67 bis 73              | 3,7       |\n' +
            '| 60 bis 66              | 4,0       |\n' +
            '| weniger als 60 Punkte  | 5,0       |\n\n'
    }

    function Veröffentlichung_der_Endnote() {
        return '### Veröffentlichung der Endnote\n' +
            '\n' +
            'Es erfolgt keine Veröffentlichung der Teilnote für den Quelltext oder für das Kolloquium. Die Endnote wird über die üblichen Wege (Portal zur Notenauskunft) gegen ' +
            veröffentlichungNote + ' bekannt gegeben.\n\n'
    }

    function Einsichtname_im_kommenden_Semester() {
        return '### Einsichtnahme im kommenden Semester\n' +
            '\n' +
            'Eine Einsichtnahme ist nur für schriftliche Prüfungen vorgesehen.\n\n'
    }
}

function Angemeldete_Studierende() {

    if (teams.length === 0) {
        return '## Angemeldete Studierende\n' +
            '\n' +
            '| Team | Matrikelnummern |\n' +
            '| ---- | ---------------- |\n' +
            '| 1 | 510000 |\n' +
            '| 2 | 510000 |\n' +
            '| 3 | 510000 |\n' +
            '| 4 | 510000 |\n' +
            '| 5 | 510000 |\n' +
            '| 6 | 510000 |\n' +
            '| 7 | 510000 |\n' +
            '| 8 | 510000 |\n' +
            '| 9 | 510000 |\n' +
            '| 10 | 510000 |\n' +
            '| 11 | 510000 |\n' +
            '| 12 | 510000 |\n' +
            '| 13 | 510000 |\n' +
            '| 14 | 510000 |\n' +
            '| 15 | 510000 |\n\n'
    } else {

        let oralExams;
        if (mündlichePrüfungen === undefined || mündlichePrüfungen === '') {
            oralExams = '';
        } else {
            oralExams = '\n' +
                'Die mündlichen Prüfungen finden am ' + formatDateTime(mündlichePrüfungen) + ' über Zoom bzw. in Präsenz statt. Wir benutzen den gleichen Zoom Meeting-Raum wie bei der wöchentlichen Vorlesungsterminen. Das ist ein *endgültiger* Zeitplan. Wenn keine Abgabe erfolgt, findet auch keine mündliche Prüfung statt und alle nachfolgenden Termine rutschen nach vorne. \n' +
                '\n';
        }

        return '## Angemeldete Studierende und Prüfungszeit\n'
            + oralExams +
            '| Team | Matrikelnummern  | Thema | Uhrzeit | Status |\n' +
            '| ---- | ---------------- | ----- | ------- | ------ |\n' +
            printTeams(teams)
            + '\n';
    }

    /**
     * @name printTeams()
     * @description creates the Markdown table for the **Teams**
     * @description Teams are the same as Angemeldete Studierende
     * @returns {string}
     */
    function printTeams(teams) {
        let table = '';
        let sep = '\t| '
        for (let team of teams) {
            table += '| ' + formatID(team.id) + sep + printMatrikelnummern(team) + sep + formatID(team.themaID) + sep + team.uhrzeit + sep + team.status + '|\n'
        }
        return table;
    }
}

function Prüfungsthemen() {

    if (themen.length === 0) {
        return '## Prüfungsthemen\n' +
            '\n' +
            '| Nummer | Thema | Beschreibung | Repository | Matrikelnummern |\n' +
            '| ------ | ----- | ------------ | ---------- | --------------- |\n' +
            '| 01 | | | [Bitbucket](https://bitbucket.student.fiw.fhws.de:8443/projects/PUVS/) | | |\n' +
            '| 02 | | | | | |\n' +
            '| 03 | | | | | |\n' +
            '| 04 | | | | | |\n' +
            '| 05 | | | | | |\n' +
            '| 06 | | | | | |\n' +
            '| 07 | | | | | |\n' +
            '| 08 | | | | | |\n' +
            '| 09 | | | | | |\n' +
            '| 10 | | | | | |\n' +
            '| 11 | | | | | |\n' +
            '| 12 | | | | | |\n' +
            '| 13 | | | | | |\n' +
            '| 14 | | | | | |\n' +
            '| 15 | | | | | |\n\n'
    } else {
        let table = '## Prüfungsthemen\n' +
            '\n' +
            '| Nummer | Thema | Umfang | Beschreibung | Repository | Matrikelnummern |\n' +
            '| ------ | ----- | -------| ----- | ---------- | --------------- |\n'
        table += printPrüfungsThemenTable()
        table += '\n'
        return table;
    }

    /**
     * @name printPrüfungsThemenTable
     * @description creates the Markdown table for the **topics**
     * @returns {string}
     */
    function printPrüfungsThemenTable() {
        let table = ''
        for (let thema of themen) {
            table += '| ' +
                ("0" + thema.id).slice(-2) + ' | ' +
                thema.thema + ' | ' +
                thema.umfang + ' | ' +
                thema.beschreibung + ' | ' +
                '[Bitbucket](' + thema.link + ') | '

            if (teams.find(t => t.themaID === thema.id) !== undefined) {
                table += printMatrikelnummern(teams.find(t => t.themaID === thema.id))
            }
            table += ' |\n';
        }
        return table;
    }
}



function formatID(id) {
    return (id < 10) ? ('0' + id) : id;
}

function printMatrikelnummern(team) {
    let content = team.studenten[0];
    if (team.studenten.length === 2) content += ', ' + team.studenten[1];
    return content;
}

function formatDateTime(datetime) {

    let formatted = datetime.split(" ");
    let day = formatted[0].split('.')[0];
    let month = formatted[0].split('.')[1];
    let year = formatted[0].split('.')[2];

    let date = new Date(year + '-' + month + '-' + day);

    let weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    let weekday = weekdays[date.getDay()];

    // Wochentag, den dd.mm.yyyy [um hh:mm Uhr]
    return (formatted[1] !== '') ? (weekday + ', den ' + formatted[0] + ' um ' + formatted[1] + ' Uhr') : (weekday + ', den ' + formatted[0]);
}

function getEineKeinePlaceholder(bool) {
    return (bool) ? 'eine' : '**keine**';
}

