const CONST = require('./constants');
const handlers = require('./handlers');

module.exports = {
  processFeatureToggle,
  verifyFeatureAndGetToggleStatus,
  verifyFeatureKeyAndGetFeature,
  verifyRootAndGetFeatureKeys,
};

/**
 * Processes the :featureToggle depending on its .type property.
 *
 * @param {Object} featureToggle
 *
 * @throws {Error} CONST.ERROR.UNSUPPORTED_TYPE when .type doesn't match a
 *                  known type
 * @return {Object}
 */
function processFeatureToggle(featureToggle) {
  if (typeof(featureToggle) !== 'object') {
    return featureToggle;
  }
  if (typeof(featureToggle.type) !== 'string') {
    throw new Error(`Feature 'type' should be a a string`);
  }
  return handlers(featureToggle.type)(featureToggle);
};

/**
 * Verifies the feature and retrieves the toggle status.
 *
 * @param {Object} feature
 * @param {String} environment
 *
 * @return {Object}
 */
async function verifyFeatureAndGetToggleStatus(feature, environment) {
  if (typeof(feature) !== 'object') {
    throw new Error('The feature definition should be an object.');
  } else {
    let toggleStatus = {};
    for (const environmentKey in feature) {
      if (environmentKey === environment || !environment) {
        const toggle = feature[environmentKey];
        try {
          toggleStatus[environmentKey] = {
            value: await processFeatureToggle(toggle),
            error: false,
            message: CONST.ERROR.SUCCESS,
            toggle,
          };
        } catch (ex) {
          log.error(ex);
          toggleStatus[environmentKey] = {
            value: null,
            error: true,
            message: ex.message,
            toggle,
          };
        }
      }
    }
    return toggleStatus;
  }
};

/**
 * Verifies the integirty of the featureKey and returns the feature from root.
 *
 * @param {Object} root
 * @param {String} featureKey
 *
 * @return {Object}
 */
function verifyFeatureKeyAndGetFeature(root, featureKey) {
  if (featureKey.match(CONST.LABEL_VALIDATOR) === null) {
    throw new Error(`The feature key label ('${featureKey}') is not valid.`);
  } else {
    return root[featureKey];
  }
};

/**
 * Verifies the root integrity and returns the keys of the root object.
 *
 * @param {Object} root
 *
 * @return {Array}
 */
function verifyRootAndGetFeatureKeys(root) {
  if (typeof(root) !== 'object') {
    throw Error('The root should be an object.');
  } else {
    return Object.keys(root);
  }
};
