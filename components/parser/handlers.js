const fs = require('fs');
const path = require('path');

const moment = require('moment');

const CONST = require('./constants');
let _acceptanceHandlers;

module.exports = handlers;

/**
 * Returns the handler for a given feature toggle :type.
 *
 * @param {*} type
 * @return {Function}
 */
function handlers(type) {
  if (!handlers[type]) {
    throw new Error(CONST.ERROR.UNSUPPORTED_TYPE);
  } else {
    return handlers[type];
  }
};

handlers._acceptanceHandlers = _acceptanceHandlers;
handlers._getAcceptanceHandlers = _getAcceptanceHandlers;
handlers.acceptance = handleAcceptanceToggle;
handlers.schedule = handleScheduleToggle;
handlers.static = handleStaticToggle;
handlers.variant = handleVariantToggle;

/**
 * @param {Object} featureToggle
 * @return {Booleab}
 */
function handleScheduleToggle(featureToggle) {
  const {values} = featureToggle;
  const now = (new Date());
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  const currentTimestamp = now.getTime() + timezoneOffset;
  return values.reduce((existing, current) => {
    const start = moment(current.from, 'YYYY-MM-DD HH:mm:ss')
      .toDate().getTime();
    const end = moment(current.to, 'YYYY-MM-DD HH:mm:ss')
      .toDate().getTime();
    return (
      (
        (start < currentTimestamp)
        && (currentTimestamp < end)
      )
      || existing
    );
  }, false);
};

/**
 * @param {Object} featureToggle
 * @return {Booleab}
 */
function handleVariantToggle(featureToggle) {
  const {values} = featureToggle;
  const percentageTotal = values.reduce(
    (currentPercentage, variant) => (currentPercentage + variant.percentage), 0
  );
  if (percentageTotal !== 100) {
    throw new Error(CONST.ERROR.PERCENTAGE_MISMATCH);
  }
  let randomValue = Math.ceil(Math.random() * 10000) / 100;
  let variantIndex = -1;
  while (randomValue > 0) {
    randomValue -= values[++variantIndex].percentage;
  }
  return values[variantIndex].value;
}

/**
 * @param {Object} featureToggle
 * @return {Booleab}
 */
async function handleAcceptanceToggle(featureToggle) {
  const acceptanceHandlers = _getAcceptanceHandlers();
  if (typeof(acceptanceHandlers[featureToggle.source]) !== 'undefined') {
    const AcceptanceHandler = acceptanceHandlers[featureToggle.source];
    const integration = new AcceptanceHandler();
    try {
      const state = await integration.verifyStories({
        stories: featureToggle.values,
        desiredState: featureToggle.state,
      });
      return state.achieved;
    } catch (ex) {
      log.error(ex);
      throw ex;
    }
  } else {
    throw new Error(CONST.ERROR.UNSUPPORTED_SOURCE);
  }
};

/**
 * @param {Object} featureToggle
 * @return {Booleab}
 */
function handleStaticToggle(featureToggle) {
  if (typeof(featureToggle.value) === 'undefined') {
    throw new Error(`When the feature 'type' property is static, a 'value' property should be defined.`); // eslint-disable-line max-len
  }
  return featureToggle.value;
};

/**
 * Returns a list of available acceptance handlers
 *
 * @return {Object}
 */
function _getAcceptanceHandlers() {
  if (typeof(_acceptanceHandlers) !== 'object') {
    const integrationsPath = path.join(__dirname, '../integration');
    _acceptanceHandlers = fs.readdirSync(integrationsPath)
      .reduce((existing, integrationSource) => {
        return Object.assign(
          existing,
          {
            [integrationSource]:
              require(path.join(integrationsPath, `/${integrationSource}`)),
          }
        );
      }, {});
  }
  return _acceptanceHandlers;
};
