const utils = require('../../../components/utils');

describe('components/utils', () => {
  describe('.splitFilename()', () => {
    const {splitFilename} = utils;
    it('works as expected', () => {
      expect(splitFilename('')).to.eql({
        extension: '',
        filename: '',
      });
      expect(splitFilename('nodot')).to.eql({
        extension: '',
        filename: 'nodot',
      });
      expect(splitFilename('.')).to.eql({
        extension: '',
        filename: '',
      });
      expect(splitFilename('.b')).to.eql({
        extension: 'b',
        filename: '',
      });
      expect(splitFilename('a.b')).to.eql({
        extension: 'b',
        filename: 'a',
      });
      expect(splitFilename('a.b.c')).to.eql({
        extension: 'c',
        filename: 'a.b',
      });
      expect(splitFilename('a.b.c.d')).to.eql({
        extension: 'd',
        filename: 'a.b.c',
      });
    });
  });
});
