const {
  verifyFeatureAndGetToggleStatus,
  verifyFeatureKeyAndGetFeature,
  verifyRootAndGetFeatureKeys,
} = require('./utils');

module.exports = {
  parse,
};

/**
 * Entrypoint for parsing a feature manifest
 *
 * @param {Object} featureJson
 * @param {String} environment
 *
 * @return {Object}
 */
async function parse(featureJson, environment) {
  const featureKeys = await verifyRootAndGetFeatureKeys(featureJson);
  const toggleStatuses = await Promise.all(featureKeys.map(
    async (featureKey) => {
      const feature =
        await verifyFeatureKeyAndGetFeature(featureJson, featureKey);
      return {
        [featureKey]:
          await verifyFeatureAndGetToggleStatus(feature, environment),
      };
    }
  ));
  return toggleStatuses.reduce(
    (existing, feature) => {
      const featureKey = Object.keys(feature)[0];
      let featureFlag = feature;
      if (environment) {
        featureFlag = {[featureKey]: feature[featureKey][environment]};
      }
      return Object.assign({}, existing, featureFlag);
    }, {}
  );
};
