const api = require('../../lib/backend/interface');
const auth = require('../../lib/backend/bitbucket/auth').getCredentials();
const Conf = require("./../../lib/backend/auth/credentials");
const stash = require('stash-client');
const get = require('../../lib/backend/bitbucket/get');
const repo = require('../../lib/backend/handler/repository');
const update = require('../../lib/backend/git/update');
const whereIsIt = require('../../lib/backend/bitbucket/auth');

const expect = require('chai').expect;


describe('API-CLIENT', () => {
    it('getUsers()', async () => {
        const response = await api.getUsers();
        expect(response.values)
            .to.be.an.instanceof(Array)
            .and.to.have.property(0)
            .that.includes.all.keys(['name', 'emailAddress', 'id', 'displayName'])
            .and.not.empty;
    });
    it('getRepositories()', async () => {
        const response = await api.getRepositories('PT');
        expect(response.values)
            .to.be.an.instanceof(Array)
            .and.to.have.property(0)
            .that.includes.all.keys(['slug', 'id', 'name', 'scmId', 'state', 'statusMessage', 'forkable', 'project'])
            .and.not.empty;
    });
    it('getProjects()', async () => {
        const response = await api.getProjects();
        expect(response.values)
            .to.be.an.instanceof(Array)
            .and.to.have.property(0)
            .that.includes.all.keys(['id', 'key', 'links', 'name', 'public', 'type'])
            .and.not.empty;
    });
    it('authenticate()', async () => {
        let c = new Conf();
        const credentials = auth
        await c.initialized(credentials.username, credentials.password)
        await expect([auth.username, auth.password]).to.eql([credentials.username, credentials.password]);
    });
    // it('+', async () => {
    //     const response = await api.createRepository("test-CLI2343523556", "PT");
    //     console.log(response);
    //     // todo expect values;
    // });
    // it('+', async () => {
    //     const response = await
    //     // todo function();
    //     console.log(response);
    //     // todo expect values;
    // });
    // it('+', async () => {
    //     const response = await
    //     // todo function();
    //     console.log(response);
    //     // todo expect values;
    // });
    // it('+', async () => {
    //     const response = await
    //     // todo function();
    //     console.log(response);
    //     // todo expect values;
    // });

});
