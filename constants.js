module.exports = {
  DEFAULT: {
    DATA_SOURCE: 'data/features',
    PORT: 3000,
  },
  EXIT_CODE: {
    OK: 0,
    // GENERIC ERRORS: 1 - 11
    NOT_OK: 1,
    // SYSTEM ERRORS: 100 - 1111
    ADDRESS_IN_USE: 4,
    // LOGICAL ERRORS: 100000 - 11111
    FEATURE_PATH_DOESNT_EXIST: 32,
    FEATURE_PATH_NOT_DIRECTORY: 33,
  },
};
