# Parallel and Distributed Systems -- Praktische Prüfung im Sommersemester 2020

## Einführung

Die Durchführung von schriftlichen Prüfungen gestaltet sich in diesem Semester aufgrund von noch nicht absehbaren Anforderungen bzgl. Abstandsregelungen und maximaler Anzahl von Personen in einem Raum sehr schwer. Wir haben daher in der Fakultät versucht, in möglichst vielen Modulen die Prüfungsform so zu ändern, dass die Prüfung mit weniger Platzbedarf im Gebäude und im Notfall sogar digital durchgeführt werden kann. 

Für das Modul "Parallele und Verteilte Systeme" werden wir in diesem Semester auf eine **praktische Prüfungsleitung** wechseln, die in Teams von max. zwei Studierenden bearbeitet werden kann. Wir schätzen den Aufwand zur Bearbeitung dieser Prüfungsleistung auf ca. 30 Stunden pro Person, was nach unseren Umfrageergebnissen aus den letzten Jahren der Zeit entspricht, die Sie für die Vorbereitung auf die schriftliche Prüfung investiert hätten oder investiert haben sollen. Es besteht für die Studierenden kein Anspruch darauf, dass im kommenden Semester die gleiche Prüfungsform angewendet werden wird.

## Praktische Prüfungsleistung

Die praktische Prüfungsleistung besteht aus der Bearbeitung einer vorgegebenen Aufgabe zur Entwicklung einer Software im Rahmen der Inhalte der Vorlesung mit einem Schwerpunkt auf das Thema REST. Die Aufgabe kann alleine oder in Teams von maximal zwei Studierenden bearbeitet werden. Die Zuordnung der Aufgaben zu den Studierenden erfolgt durch ein Losverfahren. 

Für jede Aufgabe wird ein eigenes Repository im [Bitbucket System der Fakultät Informatik und Wirtschaftsinformatik](https://bitbucket.student.fiw.fhws.de:8443) angelegt. Sobald die Aufgaben den Studierenden zugelost worden sind, werden die Repositories auch jeweils so abgesichert, dass nur die bearbeitenden Studierenden Zugriff auf das Repository der Aufgabe erhalten. 

Die Abgabe des Ergebnisses in Form eines Repositories im [Bitbucket System der Fakultät Informatik und Wirtschaftsinformatik](https://bitbucket.student.fiw.fhws.de:8443) erfolgt bis Samstag, den 18.07.2020 (erster Tag im Prüfungszeitraum) um 18:00 Uhr. Anschließend wird der schreibende Zugriff auf das Repository für die Studierenden gesperrt. Es ist **keine** Dokumentation der Projektes oder des Quelltextes zu erstellen, ebenso ist **keine** Präsentation zu erstellen. Die Commit-Historie und die Qualität der Commit-Nachrichten wird **nicht** bewertet.

Pro Aufgabe findet mit den beteiligten Studierenden im Prüfungszeitraum ein kurzes verpflichtendes **Kolloquium** statt, in dem von den Prüfenden Fragen zum Quelltext und zur Lösung der Aufgabe gestellt werden können. Dies dient hauptsächlich der Feststellung, ob der Quelltext selber verfasst wurde. Dieser Teil der Prüfung findet voraussichtlich in Form einer Videokonferenz über Zoom statt. Studierende, die nicht an einer Videokonferenz teilnehmen können oder wollen, erhalten Gelegenheit zum Zutritt zum Gebäude am Sanderheinrichsleitenweg 20 in Würzburg.

## Termine

| Datum      | Beschreibung |
| ---------- | ------------ |
| 01.06.2020 | Veröffentlichung der Rahmenbedingungen und Thema |
| 05.06.2020 | Letzter Tag zur Prüfungsanmeldung |
| 08.06.2020 | Zulosung der Aufgaben zu den Studierenden |
| 15.06.2020 | Möglichkeit zur Klärung von Fragen zwischen 15 Uhr und 19 Uhr |
| 02.07.2020 | Möglichkeit zur Klärung von Fragen zwischen 9 Uhr und 13 Uhr |
| 13.07.2020 | Möglichkeit zur Klärung von Fragen zwischen 15 Uhr und 19 Uhr |
| 18.07.2020 | Einfrieren der Repositories um 18 Uhr |
| TBD        | Kolloquium (15 Minuten pro Thema im Zeitraum 20.07.2020 bis 08.08.2020) | 

## Bewertungskriterien

### Generelle Rahmenbedingungen

1. Zu entwickeln ist die Software für den Server einer verteilten Client/Server Anwendung.
2. Die Entwicklung eines Clients (mobile oder Web-basiert) kann gerne auf freiwilliger Basis erfolgen, wird aber **nicht** bewertet. 
3. Die Entwicklung der Software für den Server muss in Programmiersprache Java (Version 8 oder höher) und mit den in der Vorlesung gezeigten Beispielen, Frameworks und Libraries (JAX-RS, Jersey 2, Genson, JAXB, Apache Commons Projekte, OkHttp, jwt.io, usw.) erfolgen. Es ist zulässig, Code aus den in der Vorlesung benutzten Repositories zu kopieren (z.B. die Klasse Hyperlinks oder den CORS Filter). 
4. Weitere Frameworks oder Software-Generatoren dürfen **nicht** eingesetzt werden. 
5. Die Software muss als Maven Projekt im Repository verfügbar sein (d.h. es muss eine Datei ```pom.xml``` geben und die Verzeichnisse ```src```, ```main```, usw. müssen entsprechend benannt worden sein). Die Software muss auf der Kommandozeile mit dem Kommando ```mvn -U clean package``` in ein Java-Archive (JAR-Datei) übersetzt werden können. Dieses JAR Archiv muss den Tomcat-Container enthalten und mit dem Kommando ```java -jar JAR-FILE``` gestartet werden können. 
6. Falls eine Datenbank (MySQL, Postgres, CouchDB, o.ä.) verwendet wird, muss die Anwendung in einem Docker-Container bereitgestellt werden, d.h. es muss ein Docker Compose File o.ä. im Repository enthalten sein.  
7. Wenn Testfälle implementiert werden, muss dafür JUnit verwendet werden. Die Auswahl der Client-Bibliothek für HTTP Anfragen ist beliebig. Die Testfälle müssen aus der IDE gegen den laufenden Server ohne Änderung des Quelltextes gestartet werden können.

### Zusammensetzung der Note

Es können für die Lösung der praktischen Aufgabe und das Kolloquium insgesamt 120 Punkte erreicht werden. Die Gesamtnote für dieses Modul setzt sich zusammen aus den beiden Teilnoten für

* Die Lösung der Programmieraufgabe in Form von Quelltext (Anteil an der Gesamtnote 75%, also 90 von 120 Punkten)
* Die Beantwortung der Fragen im Kolloquium (Anteil an der Gesamtnote 25%, also 30 von 120 Punkten)


### Bewertung des Quelltextes

Bei der Bewertung des Quelltextes können maximal 90 Punkte erreicht werden. 

| Kriterium         | Beschreibung | Maximale Punkte    |
| ----------------- | ------------ | ------------------ |
| Ressourcen        | Namen der Ressourcen, Attribute und deren Datentypen, Assoziationen zwischen Ressourcen, Self-Links | 10 | 
| Design der URIs   | Korrekte Benennung der Path-Elemente. Sind maximal zwei Ebenen (primär, sekundär) verwendet worden? | 5 | 
| Repräsentationen  | Auswahl geeigneter Repräsentationsformate | 5 (JSON **oder** XML); +5 (Bonus, mehr als ein Format) | 
| Dispatcher        | Gibt es einen Dispatcher State mit Hyperlinks zu allen Primärressourcen? | 5 | 
| CRUD              | Sind die CRUD Operationen und die Status-Codes korrekt umgesetzt? | 15 | 
| Hypermedia       | Sind Hyperlinks im Response Header korrekt mit Relations-Typ?  | 15 | 
| Paging            | Ist ein sinnvolles Paging Verfahren implementiert? Default-Werte sinnvoll? Hyperlinks auf Vorgänger- und Nachfolger-Seite gesetzt? Grenzfälle beachtet? | 5 | 
| Filtering         | Sind sinnvolle Filter-Parameter benutzt worden? Filtern wurde in die DAOs verlagert? Gibt es Query Templates?| 5 | 
| Authentifizierung | Korrekte Umsetzung eines Authentifizierungsverfahrens gegen eine eigene User-Datenbank; alternativ Authentifizierung gegen api.fiw.fhws.de | 10 (HTTP Basic); +5 (Bonus, Bearer mit JWT) | 
| Caching           | Auswahl eines geeigneten Caching-Verfahrens für alle GET Zugriffe. | 5; +5 (Bonus, Conditional PUT mit ETags) | 
| Test-Cases  | Gibt es für min. 80% der States min. einen Test-Fall mit JUnit? | 5 | 
| Datenbanken       | Verwendung des DAO Musters, Trennung von Interfaces und Implementierung | 5 (in-memory); +5 (Bonus, externes DBMS)| 
| Lesbarkeit des Quelltextes | Einhalten von Source Code Konventationen (Benennung, Formatierung, pro Methode nur eine Aufgabe) | +10 (Bonus) |

Bonus bedeutet, dass für eine besonders aufwändige Lösung mehr Punkte vergeben werden, als für die vollständige Implementierung notwendig gewesen wären. Zum Beispiel reicht für die maximale Punktzahl eine Datenbankimplementierung in-memory (mit Maps) aus. Wenn aber ein externes Datenbankmanagementsystem verwendet wurde, kann man weitere 5 Punkte erhalten.

### Bewertung des Kolloquiums

Im Kolloquium werden ausschließlich zum eigenen Quelltext und zum Stoff der Vorlesung (aber immer mit Bezug zum Quelltext) gestellt. Die Fragen haben das Ziel zu klären, ob Sie den Quelltext selbst geschrieben und verstanden haben bzw. wir als Prüfende Ihre Entscheidungen (z.B. zur Wahl der Ressourcen-Namen, zum Caching Verfahren, zur Wahl der Status-Codes, usw.) nachvollziehen zu können. **Auch bei einer Gruppenarbeit muss jeder Studierende den gesamten Quelltext erklären können.**

| Leistung      | Punkte    |
| ------------- | --------- |
| sehr gut      | 25 bis 30 |
| gut           | 20 bis 24 |
| befriedigend  | 15 bis 19 |
| ausreichend   | 10 bis 14 |
| mangelhaft    | 0 bis 9  |

### Bildung der Gesamtnote

Die Punkte für den Quelltext und die Punkte für das Kolloquim werden addiert. Ein leeres Repository am 18.07.2020 um 18:00 Uhr führt zur Gesamtnote 5,0. Nicht-Teilnahme am Kolloqium (ohne Attest) sowie Verweigerung der Beantwortung von Fragen führt zur Gesamtnote 5,0. 

| Gesamtpunktzahl        | Gesamtnote |
| ---------------------- | --------- |
| 114 bis 120            | 1,0       |
| 107 bis 113            | 1,7       |
| 100 bis 106            | 2,0       |
| 93 bis 99              | 2,3       |
| 86 bis 94              | 2,7       |
| 81 bis 87              | 3,0       |
| 74 bis 80              | 3,3       |
| 67 bis 73              | 3,7       |
| 60 bis 66              | 4,0       |
| weniger als 60 Punkte  | 5,0       |

### Veröffentlichung der Endnote

Es erfolgt keine Veröffentlichung der Teilnote für den Quelltext oder für das Kolloquium. Die Endnote wird über die üblichen Wege (Portal zur Notenauskunft) gegen Ende August bzw. Anfang September 2020 veröffentlicht. 

### Einsichtnahme im kommenden Semester

Ein Einsichtnahme ist nur für schriftlichen Prüfungen vorgesehen.

## Angemeldete Studierende

| Team | Matrikelnummern |
| ---- | ---------------- |
| 1 | 510000 |
| 2 | 510000 |
| 3 | 510000 |
| 4 | 510000 |
| 5 | 510000 |
| 6 | 510000 |
| 7 | 510000 |
| 8 | 510000 |
| 9 | 510000 |
| 10 | 510000 |
| 11 | 510000 |
| 12 | 510000 |
| 13 | 510000 |
| 14 | 510000 |
| 15 | 510000 |

## Thema

| Nummer | Thema | Beschreibung | Repository | Matrikelnummern |
| ------ | ----- | ------------ | ---------- | --------------- |
| 01 | | | [Bitbucket](https://bitbucket.student.fiw.fhws.de:8443/projects/PUVS/repos/pvs20exam01/browse) | | |
| 02 | | | | | |
| 03 | | | | | |
| 04 | | | | | |
| 05 | | | | | |
| 06 | | | | | |
| 07 | | | | | |
| 08 | | | | | |
| 09 | | | | | |
| 10 | | | | | |
| 11 | | | | | |
| 12 | | | | | |
| 13 | | | | | |
| 14 | | | | | |
| 15 | | | | | |