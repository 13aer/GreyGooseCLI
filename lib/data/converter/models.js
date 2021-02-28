class Choice {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

class Repository {
    constructor(slug, id, name, scmId, state, statusMessage, forkable, project, isPublic, links) {
        this.slug = slug;
        this.id = id;
        this.name = name;
        this.scmId = scmId;
        this.state = state;
        this.statusMessage = statusMessage;
        this.forkable = forkable;
        this.project = project;
        this.isPublic = isPublic;
        this.links = links;
    }

    getDescription() {
        return this.id + "\t" + this.name;
    }
}

class User {
    constructor(name, emailAddress, id, displayName, active, slug, type, directoryName, deletable, lastAuthenticationTimestamp, mutableDetails, mutableGroups, links) {

        this.name = name;
        this.emailAddress = emailAddress;
        this.id = id;
        this.displayName = displayName;
        this.active = active;
        this.slug = slug;
        this.type = type;
        this.directoryName = directoryName;
        this.deletable = deletable;
        this.lastAuthenticationTimestamp = lastAuthenticationTimestamp;
        this.mutableDetails = mutableDetails;
        this.mutableGroups = mutableGroups;
        this.links = links;
    }

    getDescription() {
        return this.id + "\t" + this.displayName + "\t\t" + this.emailAddress;
    }

}

class Project {
    constructor(key, id, name, isPublic, type, links) {

        this.key = key;
        this.id = id;
        this.name = name;
        this.isPublic = isPublic;
        this.type = type;
        this.links = links;
    }

    getDescription() {
        return this.id + "\t" + this.name;
    }

}

module.exports = {Choice, Repository, User, Project};