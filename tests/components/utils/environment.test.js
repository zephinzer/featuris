const path = require('path');

const environmentUtils = require('../../../components/utils/environment');

describe.only('components/utils/environment', () => {
  describe('.getAllowedOrigins()', () => {
    const {getAllowedOrigins} = environmentUtils;

    it('works as expected', () => {
      const singleEntry = 'expected_allowed_origins';
      const multiEntry = 'a,b,c';
      process.env.ALLOWED_ORIGINS = singleEntry;
      expect(getAllowedOrigins()).to.eql([singleEntry]);
      process.env.ALLOWED_ORIGINS = multiEntry;
      expect(getAllowedOrigins()).to.eql(['a', 'b', 'c']);
    });
  });

  describe('.getDataSourcePath()', () => {
    const {getDataSourcePath} = environmentUtils;
    const absolutePath = '/expected/path';
    const relativePath = 'expected/path';

    it('works as expected', () => {
      process.env.DEFAULT_DATA_SOURCE = absolutePath;
      expect(getDataSourcePath()).to.eql(absolutePath);
      process.env.DEFAULT_DATA_SOURCE = relativePath;
      expect(getDataSourcePath()).to.eql(
        path.join(process.cwd(), relativePath)
      );
    });
  });

  describe('.getPivotalTrackerApiKey()', () => {
    const {getPivotalTrackerApiKey} = environmentUtils;

    it('works as expected', () => {
      const mockPivotalTrackerApiKey = 'expected_pivotal_tracker_key';
      process.env.PIVOTAL_TRACKER_API_KEY = mockPivotalTrackerApiKey;
      expect(getPivotalTrackerApiKey()).to.eql(mockPivotalTrackerApiKey);
      delete process.env.PIVOTAL_TRACKER_API_KEY;
      expect(getPivotalTrackerApiKey()).to.eql(undefined);
    });
  });

  describe('.getPort()', () => {
    const {getPort} = environmentUtils;

    it('works as expected', () => {
      process.env.PORT = 12345;
      expect(getPort()).to.eql(12345);
      process.env.PORT = '54321';
      expect(getPort()).to.eql(54321);
      delete process.env.PORT;
      expect(getPort()).to.eql(3000);
    });

    it('throws an error if port is invalid', () => {
      process.env.PORT = 1;
      expect(() => getPort()).to.not.throw();
      process.env.PORT = 0;
      expect(() => getPort()).to.throw();
      process.env.PORT = -1;
      expect(() => getPort()).to.throw();
      process.env.PORT = 65535;
      expect(() => getPort()).to.not.throw();
      process.env.PORT = 65536;
      expect(() => getPort()).to.throw();
    });
  });
});
