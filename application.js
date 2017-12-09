const fs = require('fs');
const path = require('path');
const express = require('express');
const yaml = require('js-yaml');

const parser = require('./components/parser');
const utils = require('./components/utils');

module.exports = getApplication;

/**
 * Retrieves the application middleware
 *
 * @return {Express.Router}
 */
function getApplication() {
  const application = new express.Router();
  
  const dataSourcePath = utils.environment.getDataSourcePath();
  utils.verify.directoryExists(dataSourcePath, 'Feature source path');
  const featureSourceFileListing = fs.readdirSync(dataSourcePath);

  featureSourceFileListing.forEach((featureSourceFilename) => {
    const featureSourcePath = path.join(dataSourcePath, featureSourceFilename);
    log.info(`Processing ${featureSourcePath}...`);

    const featureSourceFile = utils.splitFilename(featureSourceFilename);
    log.info(`  - loading feature specifications...`);

    let data = null;

    try {
      switch (featureSourceFile.extension) {
        case 'json':
          data = require(featureSourcePath);
          break;
        case 'yaml':
          data = yaml.safeLoad(fs.readFileSync(featureSourcePath, 'utf8'));
          break;
        default:
          log.info(`  * not a .yaml file`);
      }
    } catch (ex) {
      log.error(ex);
      throw ex;
    }

    if (data !== null) {
      const _env = process.env.NODE_ENV || 'undefined';
      application.use(`/${featureSourceFile.filename}`, (req, res) => (
        parser.parse(data, process.env.NODE_ENV)
          .then((result) => res.json(Object.assign({}, result, {_env})))
          .catch((ex) => res.json(Object.assign({}, ex, {_env})))
        ));
      log.info(`  - done adding '/${featureSourceFile.filename}' endpoint.`);
    } else {
      log.info(`  * skipped `);
    }
  });

  application.use('/', (req, res) => {
    res.status(200).json('ok');
  });
  return application;
};
