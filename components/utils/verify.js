const fs = require('fs');

const CONST = require('../../constants');

module.exports = {
  directoryExists,
};

/**
 * Checks whether a directory exists
 *
 * @param {String} pathToDirectory
 * @param {String} pathAnnotation
 */
function directoryExists(pathToDirectory, pathAnnotation = 'Directory') {
  try {
    const pathStat = fs.statSync(pathToDirectory);
    if (!pathStat.isDirectory()) {
      log.error(`${pathAnnotation} at ${pathToDirectory} is not a directory.`);
      log.info('Exiting with code', CONST.EXIT_CODE.FEATURE_PATH_NOT_DIRECTORY);
      process.exit(CONST.EXIT_CODE.FEATURE_PATH_NOT_DIRECTORY);
    }
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      log.error(`${pathAnnotation} at ${pathToDirectory} could not be found.`);
    } else {
      log.error(ex);
    }
    log.info('Exiting with code', CONST.EXIT_CODE.FEATURE_PATH_DOESNT_EXIST);
    process.exit(CONST.EXIT_CODE.FEATURE_PATH_DOESNT_EXIST);
  }
};
