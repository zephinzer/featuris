'use strict';

const API_URL_STUB = 'https://www.pivotaltracker.com/services/v5';

module.exports = Pivotal;

/**
 * Returns a Pivotal API wrapper object.
 *
 * @param {String} _pivotalApiKey
 * @return {Pivotal}
 */
function Pivotal(_pivotalApiKey) {
  const pivotalApiKey = _pivotalApiKey || process.env.PIVOTAL_TRACKER_API_KEY;
  this.config = {
    pivotalApiKey,
  };
  return this;
};

Object.assign(Pivotal.prototype, {
  getProject,
  getStory,
  getStoryState,
  getStories,
  verifyApiKeyExists,
  verifyStories,
});

/**
 * Retrieves the project identified by ID :projectId
 *
 * @param {String} projectId
 *
 * @return {Promise}
 */
function getProject(projectId) {
  return new Promise((resolve, reject) => {
    request
      .get(`${API_URL_STUB}/projects/${projectId}`)
      .set('X-TrackerToken', this.config.pivotalApiKey) // eslint-disable-line no-invalid-this,max-len
      .then((res) => resolve(res))
      .catch(reject);
  });
};

/**
 * Retrieves the story identified by :storyId in project :projectId
 *
 * @param {Object} story
 * @param {String} story.projectId
 * @param {String} story.storyId
 *
 * @return {Promise}
 */
async function getStory({projectId, storyId}) {
  try {
    await this.verifyApiKeyExists(); // eslint-disable-line no-invalid-this
    const response = await request
      .get(`${API_URL_STUB}/projects/${projectId}/stories/${storyId}`)
      .set('X-TrackerToken', this.config.pivotalApiKey); // eslint-disable-line no-invalid-this,max-len
    const story = response.body;
    return story;
  } catch (ex) {
    throw ex;
  }
};

/**
 * Retrieves the state of the story :storyId in project :projectId
 *
 * @param {Object} story
 * @param {String} story.projectId
 * @param {String} story.storyId
 *
 * @return {Promise}
 */
async function getStoryState({projectId, storyId}) {
  try {
    await this.verifyApiKeyExists(); // eslint-disable-line no-invalid-this,max-len
    const story = await this.getStory({projectId, storyId}); // eslint-disable-line no-invalid-this,max-len
    return story.current_state;
  } catch (ex) {
    throw ex;
  }
};

/**
 * Retrieves stories belonging to the project with ID :projectId
 *
 * @param {String} projectId
 *
 * @return {Promise}
 */
async function getStories(projectId) {
  try {
    await this.verifyApiKeyExists(); // eslint-disable-line no-invalid-this,max-len
    const stories = await request
      .get(`${API_URL_STUB}/projects/${projectId}/stories`)
      .set('X-TrackerToken', this.config.pivotalApiKey); // eslint-disable-line no-invalid-this,max-len
    return stories;
  } catch (ex) {
    throw ex;
  }
};

/**
 * Verifies that the configuration includes a valid Pivotal Tracker API key
 *
 * @throws {Error}
 * @return {Boolean}
 */
function verifyApiKeyExists() {
  if (
    typeof(this.config.pivotalApiKey) == 'string' // eslint-disable-line no-invalid-this,max-len
    && this.config.pivotalApiKey.length > 1 // eslint-disable-line no-invalid-this,max-len
  ) {
    return true;
  } else {
    throw new Error('Pivotal Tracker API key could not be found');
  }
};

/**
 * Verify that the stories with IDs :storyIds in project with ID :projectId has
 * achieved a state :desiredState.
 *
 * @param {Object} storyInfo
 * @param {Array<Story>} storyInfo.stories
 * @param {String} storyInfo.stories<>.storyId
 * @param {string} storyInfo.stories<>.projectId
 * @param {String} storyInfo.desiredState
 *
 * @return {Promise}
 */
function verifyStories({stories, desiredState}) {
  let final = {
    achieved: true,
  };
  return Promise.all(
    stories.reduce((state, story, index) => {
      const {
        projectId,
        storyId,
      } = story;
      return state.concat(
        new Promise((resolve, reject) => {
          this.getStoryState({projectId, storyId}) // eslint-disable-line no-invalid-this,max-len
            .then((currentStoryState) => {
              resolve(currentStoryState === desiredState);
            })
            .catch(reject);
        }).then((stateAchieved) => ({[storyId]: stateAchieved}))
      );
    }, []))
    .then((results) => results.map((result) => Object.assign(final, result)))
    .then(() => Object.keys(final).forEach((key) => {
      final.achieved = final.achieved && final[key];
    }))
    .then(() => {
      final.timestamp = (new Date()).getTime();
      return final;
    });
};
