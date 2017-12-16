const path = require('path');
const CONST = require('../../constants');

module.exports = {
  getAllowedOrigins,
  getDataSourcePath,
  getPivotalTrackerApiKey,
  getPort,
};

/**
 * Retrieves the ALLOWED_ORIGINS environment variable
 *
 * @return {String}
 */
function getAllowedOrigins() {
  log.info('ALLOWED_ORIGINS           =',
    process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS : 'UNDEFINED'
  );
  const _allowedOrigins = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = _allowedOrigins ? _allowedOrigins.split(',') : null;
  log.info(`  - allowed origins set to ${allowedOrigins ? allowedOrigins.toString() : '*'}`); // eslint-disable-line max-len
  return allowedOrigins;
}

/**
 * Retrieves the DEFAULT_DATA_SOURCE environment variable
 *
 * @return {String}
 */
function getDataSourcePath() {
  log.info('DEFAULT_DATA_SOURCE       =',
    process.env.DEFAULT_DATA_SOURCE ?
      process.env.DEFAULT_DATA_SOURCE : 'UNDEFINED'
  );
  const defaultDataSource = process.env.DEFAULT_DATA_SOURCE || CONST.DEFAULT.DATA_SOURCE;

  const dataSourcePath = (defaultDataSource.indexOf('/') === 0) ?
    defaultDataSource : path.join(
      process.cwd(), defaultDataSource
    );
  log.info(`  - data source path set to ${dataSourcePath}`);
  return dataSourcePath;
};

/**
 * Retrieves the PIVOTAL_TRACKER_API_KEY environment variable
 *
 * @return {String}
 */
function getPivotalTrackerApiKey() {
  log.info('PIVOTAL_TRACKER_API_KEY   =',
    process.env.PIVOTAL_TRACKER_API_KEY ? 'DEFINED' : 'UNDEFINED'
  );
  if (!process.env.PIVOTAL_TRACKER_API_KEY) {
    log.warn('  * integrations with Pivotal Tracker will not work');
  }
  const pivotalTrackerApiKey =
    process.env.PIVOTAL_TRACKER_API_KEY ?
      process.env.PIVOTAL_TRACKER_API_KEY : undefined;
  return pivotalTrackerApiKey;
};

/**
 * Retrieves the PORT environment variable
 *
 * @return {String}
 */
function getPort() {
  log.info('PORT                      =',
    process.env.PORT ? process.env.PORT : 'UNDEFINED'
  );
  const defaultPort = (typeof(process.env.PORT) === 'undefined')
    ? CONST.DEFAULT.PORT : process.env.PORT;
  let port;
  try {
    port = Number.parseInt(defaultPort);
  } catch (ex) {
    log.error(`  * specified port (${port}) is not a number`);
  }
  if (port > 65535) {
    log.error(`  * specified port (${port}) is above the valid number of ports`); // eslint-disable-line max-len
    throw new Error(`Port number ${port} is more than 65535`);
  } else if (port < 1) {
    log.error(`  * specified port (${port}) is below the valid number of ports`); // eslint-disable-line max-len
    throw new Error(`Port number ${port} is less than than 1`);
  }
  log.info(`  - port set to ${port}`);
  return port;
};
