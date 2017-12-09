module.exports = {
  get,
  init,
  set,
};

let _cache;

/**
 * Retrieves the key :key from the cache.
 *
 * @param {String} key
 * @return {*}
 */
function get(key) {
  return _cache[key];
};

/**
 * Initialises the cache
 */
function init() {
  _cache = {};
};

/**
 * Sets the key :key to the value :value in the cache.
 *
 * @param {String} key
 * @param {*} value
 */
function set(key, value) {
  _cache[key] = value;
};
