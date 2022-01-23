/* eslint-disable global-require */
/* eslint-disable no-console */
const ShareXAPI = require(`${__dirname}/server/app`);
/** Setting definitions for the config file and server class */
let c;
let server;

/** Determines whether or not to use the test config or not.
 * Test env config does not get pushed to git
 * @returns {void}
 */
async function loadConfig() {
    process.argv[2] === '-test'
        ? c = require(`${__dirname}/config.real.json`)
        : c = require(`${__dirname}/config.json`);
}

loadConfig().then(() => {
    /** Starting server using the selected config file */
    server = new ShareXAPI(c);
});
process.on('SIGINT', async () => {
    server.log.warning('Gracefully exiting..');
    process.exit();
});

process.on('unhandledRejection', async err => server.log.uncaughtError(err.stack));
process.on('uncaughtException', async err => server.log.uncaughtError(err.stack));
