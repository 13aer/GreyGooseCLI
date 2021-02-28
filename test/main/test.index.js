const {Command} = require('commander');
const {description, version} = require('../../package.json');
const menu = require('../../lib/frontend/menus/main');
const login = require('../../lib/frontend/menus/login');
const authHandler = require('../../lib/backend/bitbucket/auth')

const expect = require('chai').expect;


describe('commander flags', () => {
    const program = new Command();
    it('-v -version Show version', async () => {
        const response = await program.version(version, '-v, -version', 'Show version')._version;
        expect(response).to.equal(
            {version}.version
        );
    });
    it('discripton', async () => {
        const response = await program.description(description)._description;
        expect(response).to.equal(
            {description}.description
        );
    });

});
describe('auth-functions', () => {
    it('exists', async () => {
        const response = await authHandler.exists();
        expect(response).to.equal(
            false || true
        );
    });
    it('getCredentials()', async () => {
        const response = await authHandler.getCredentials();
        expect(response).that.includes.all.keys(['password', 'username', 'type', 'url']).and.not.empty;
    });
    it('setUsername()', async () => {
        const response = await authHandler.setUsername('test');
        expect(authHandler.getCredentials().username).to.equal('test').and.not.empty;
    });
    it('setPassword()', async () => {
        const response = await authHandler.setPassword('test');
        expect(authHandler.getCredentials().password).to.equal('test').and.not.empty;
    });
    it('reset()', async () => {
        const response = await authHandler.reset();
        expect(authHandler.getCredentials()).that.includes.all.keys(['password', 'username']).not.empty;
    });

});
