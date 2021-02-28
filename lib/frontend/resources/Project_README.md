# Template Project for Parallel and Distributed Systems 

----

This repository contains a template that can be used for the practical examination 
in module Parallel and Distributed Systems in Summer Semester 2020. 

## First steps

At first, please clone this repository **and** the repository for your project. You find the link to *your* project in the [overview](https://bitbucket.student.fiw.fhws.de:8443/projects/PUVS/repos/practical-exam-summer-semester-2020/browse). 

Copy the files from this template into your project directory. 

1. File `pom.xml`
2. File `.gitignore`
3. Directory `src`
4. Directory `etc`

## Setup your project

You might want to change (but you don't have to):

* The name of your project in file `pom.xml` at tags `artifactId` and `name`.

Please leave the name of the directory (and package) `de.fhws.fhws.fiw.pvs.exam` unchanged. You can (and should) add other directories, of course. But the main class `Start` should remain at this place and should *not* be renamed.

Import your project in your IDE as Maven project. 

If you use IntelliJ, please import the code formatting style from file `etc/codeformat.xml` and apply this style in your project. IntelliJ has some nice *Save* actions that are executed whenever you save a file. This is a good place to auto-format your code. 

## Keep the repository clean

Please, don't add unnecessary files to the repository. All files that belong to the configuration of your IDE, all class files, temporary files that you might need for testing **must** not be added to the repository. Make use of file `.gitignore` to excludes files (based on file names or pattern) from the repository. 

## Using Git

* Commit as often as possible (but we don't mark your commit messages)
* Use branches if you want to work in parallel on different features 
* Push the final code in branch `master`

## Package structure

It is probably a good idea to have in `src/main/java/de/fhws/fiw/pvs/exam`

* a directory `resources` for the Java classes that describe the resources
* a direcotry `services` for the Java classes that implement the REST services
* a directory `dao` for the Java classes for the in-memory storage

## Adding dependencies 

If you need additional third-party libraries, you **must** add them to file `pom.xml`. 

If you want to use XML Binding and you use Java version 9 or higher, you must add the following dependency:

```
<dependency>
<groupId>javax.xml.bind</groupId>
<artifactId>jaxb-api</artifactId>
<version>2.3.1</version>
</dependency>
```

## Test cases

Test cases must be implemented using JUnit and belong in directory `/src/test/...` Separate your test cases in different classes to make it more readable. 

## What we check when we mark your solution

1. We execute `mvn -DskipTests=true package` to create a JAR file for your project in directory `target`. Option `-DskipTests` tells Maven *not* to execute the test cases in this step.
2. We start the server using `java -jar target/examtemplate-0.0.1-jar-with-dependencies.jar` (providing `examtemplate` is your `artificatId`).
3. We run the test cases manually from the IDE against your server. Of course, all test cases **must** be green. 