const winston = require('winston');

const CONST = require('./constants');
const utils = require('./components/utils');

const preLogInitialisationLogs = [];
if (process.env.NODE_ENV === 'development') {
  preLogInitialisationLogs.push('Loaded environment using dotenv...');
  require('dotenv').config();
} else {
  preLogInitialisationLogs.push('No environment was loaded...');
}

winston.configure({
  transports: [
    new winston.transports.Console({
      exitOnError: false,
      level: 'debug',
      prettyPrint: false,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      silent: (process.env.LOGS_DISABLED == 'true'),
      json: (process.env.LOGS_FORMAT == 'json'),
      colorize: (process.env.LOGS_FORMAT == 'text')
                && (process.env.LOGS_COLORIZE != 'false'),
      timestamp: (process.env.LOGS_TIMESTAMP == 'true'),
      showLevel: (process.env.LOGS_SHOW_LEVEL == 'true'),
      stringify: (process.env.LOGS_STRINGIFY == 'true'),
    }),
  ],
});

global.log = winston;
global.request = require('superagent');

preLogInitialisationLogs.forEach((lineOfLog) => {
  log.info(lineOfLog);
});

log.info('NODE_ENV                  =',
  process.env.NODE_ENV ? process.env.NODE_ENV : 'UNDEFINED'
);
utils.environment.getPivotalTrackerApiKey();
const port = utils.environment.getPort();

const server = require('./server');
const application = require('./application');

server.use('/', application());

if (!module.parent) {
  server
    .listen(port, (err) => {
      if (!err) {
        log.info(`Application available at http://localhost:${port}`);
      } else {
        log.error('Unknown error occurred. Logs as follows...');
        log.error(err);
        log.error(`Exiting with status code ${CONST.EXIT_CODE.NOT_OK}.`);
        process.exit(CONST.EXIT_CODE.NOT_OK);
      }
    })
    .on('error', (err) => {
      switch (err.code) {
        case 'EACCES':
          log.error(`Port ${port} is already in use.`);
          log.error(`Exiting with status code ${CONST.EXIT_CODE.ADDRESS_IN_USE}.`); // eslint-disable-line max-len
          process.exit(CONST.EXIT_CODE.ADDRESS_IN_USE);
          break;
        default:
          log.error(err);
          process.exit(1);
      }
    });
}
