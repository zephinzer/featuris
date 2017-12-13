const parser = require('../../../components/parser');

describe('components/parser', () => {
  describe('.parse()', () => {
    let {parse} = parser;
    let testFeatureJson;

    before(() => {
      testFeatureJson = require('../../.data/featureJson.json');
      const now = (new Date()).getTime();
      const from = moment(now).format('YYYY-MM-DD 00:00:00');
      const tomorrow = now + 1000 * 60 * 60 * 24;
      const to = moment(tomorrow).format('YYYY-MM-DD 00:00:00');
      testFeatureJson.test_schedule_pass.development.values =
        testFeatureJson.test_schedule_pass.development.values.concat({
          from,
          to,
        });
    });

    it('returns the correct keys', () =>
      parse(testFeatureJson, 'development')
        .then((result) => {
          expect(result).to.have.keys([
            'test_schedule_pass',
            'test_schedule_fail',
            'test_static_string',
            'test_static_float',
            'test_static_boolean',
            'test_static_object',
            'test_variant',
          ]);
        })
    );

    context('static flags', () => {
      it('works as expected', () =>
        parse(testFeatureJson, 'development')
          .then((result) => {
            expect(result.test_static_string.value).to.eql('static_string');
            expect(result.test_static_float.value).to.eql(1.2345);
            expect(result.test_static_boolean.value).to.eql(true);
            expect(result.test_static_object.value).to.eql({
              isObject: true,
            });
          })
      );
    });

    context('schedule flags', () => {
      it('works as expected', () =>
        parse(testFeatureJson, 'development')
          .then((result) => {
            expect(result.test_schedule_pass.value).to.be.true;
            expect(result.test_schedule_fail.value).to.be.false;
          })
      );
    });

    context('variant flags', () => {
      const sampleSize = 100;
      const allowedDeviation = 6;

      it('works as expected', () =>
        Promise.all(
          (() => {
            const allSamples = [];
            for (let i = 0; i < sampleSize; ++i) {
              allSamples.push(parse(testFeatureJson, 'development'));
            }
            return allSamples;
          })()
        ).then((results) => {
          const As = results.reduce((value, result) => {
            return value + ((result.test_variant.value === 'a') ? 1 : 0);
          }, 0);
          const Bs = results.reduce((value, result) => {
            return value + ((result.test_variant.value === 'b') ? 1 : 0);
          }, 0);
          const Cs = results.reduce((value, result) => {
            return value + ((result.test_variant.value === 'c') ? 1 : 0);
          }, 0);
          expect(Math.ceil(As/sampleSize*10)).to.be.at.least(1);
          expect(Math.floor(As/sampleSize*10)).to.be.at.most(3);
          expect(Math.ceil(Bs/sampleSize*10)).to.be.at.least(4);
          expect(Math.floor(Bs/sampleSize*10)).to.be.at.most(6);
          expect(Math.ceil(Cs/sampleSize*10)).to.be.at.least(2);
          expect(Math.floor(Cs/sampleSize*10)).to.be.at.most(3);
          try {
            expect(Bs).to.be.greaterThan(As);
          } catch (ex) {
            expect(Math.abs(Bs - As)).to.be.below(allowedDeviation);
          }
          try {
            expect(Bs).to.be.greaterThan(Cs);
          } catch (ex) {
            expect(Math.abs(Bs - Cs)).to.be.below(allowedDeviation);
          }
          try {
            expect(Cs).to.be.greaterThan(As);
          } catch (ex) {
            expect(Math.abs(Cs - As)).to.be.below(allowedDeviation);
          }
        })
      );
    });
  });
});
