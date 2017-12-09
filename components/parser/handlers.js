const CONST = require('./constants');
const utils = require('../utils');

module.exports = handlers;

/**
 * Returns the handler for a given feature toggle :type.
 *
 * @param {*} type
 * @return {Function}
 */
function handlers(type) {
  if (!handlers[type]) {
    throw new Error(CONST.ERROR>UNSUPPORTED_TYPE);
  } else {
    return handlers[type];
  }
};

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
  const moment = require('moment');
  const now = (new Date()).getTime();
  return values.reduce((existing, current) => {
    const start = moment(current.from, 'YYYY-MM-DD hh:mm:ss')
      .toDate().getTime();
    const end = moment(current.to, 'YYYY-MM-DD hh:mm:ss')
      .toDate().getTime();
    return (((start < now) && (now < end)) || existing);
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
  let randomValue = Math.floor(Math.random() * 10000) / 100;
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
  switch (featureToggle.source) {
    case 'pivotal':
      const Pivotal = require('../integration/pivotal');
      const pivotalTrackerApiKey = utils.environment.getPivotalTrackerApiKey();
      const pivotal = new Pivotal(pivotalTrackerApiKey);
      try {
        const state = await pivotal.verifyStories({
          stories: featureToggle.values,
          desiredState: featureToggle.state,
        });
        return state.achieved;
      } catch (ex) {
        log.error(ex);
        throw ex;
      }
    default:
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
