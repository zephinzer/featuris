const environment = require('./environment');
const verify = require('./verify');

module.exports = {
  environment,
  splitFilename,
  verify,
};

/**
 * Splits the filename into an extension and a filename
 * @param {String} filePath
 * @return {Object}
 */
function splitFilename(filePath) {
  const extensionIndex = filePath.lastIndexOf('.');
  const extension = (extensionIndex === -1) ? '' :
    filePath.substr(extensionIndex + 1);
  const filename = (extensionIndex === -1) ? filePath :
    filePath.substr(0, extensionIndex);
  return {extension, filename};
};
