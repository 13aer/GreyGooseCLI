const indexTest = require('./main/test.index');
const apiTest = require('./backend/test.api');

describe('PEG-complete-test', () => {
    it('INDEX', async () => {
        const response = indexTest;
    });
    it('API)', async () => {
        const response = apiTest;
    });
});