const moment = require('moment');
const rewire = require('rewire');
const parserHandlers = rewire('../../../components/parser/handlers');

describe('components/parser/handlers', () => {
  describe('()', () => {
    it('contains the correct static methods', () => {
      expect(parserHandlers).to.have.keys([
        '_acceptanceHandlers',
        '_getAcceptanceHandlers',
        'acceptance',
        'schedule',
        'static',
        'variant',
      ]);
    });

    it('returns the correct type of handler', () => {
      expect(parserHandlers('acceptance')).to.eql(parserHandlers.acceptance);
      expect(parserHandlers('schedule')).to.eql(parserHandlers.schedule);
      expect(parserHandlers('static')).to.eql(parserHandlers.static);
      expect(parserHandlers('variant')).to.eql(parserHandlers.variant);
    });

    it('throws an error if handler cannot be identified', () => {
      expect(() => parserHandlers('others')).to.throw();
    });
  });

  describe('.handleScheduleToggle()', () => {
    const handleScheduleToggle = parserHandlers.schedule;
    let featureToggleOutOfRange;
    let featureToggleInRange;

    before(() => {
      const now = (new Date());
      const oneSecond = 1000;
      const oneMinute = 60 * oneSecond;
      const timezoneOffset = now.getTimezoneOffset() * oneMinute;
      const currentTimestamp = now.getTime() + timezoneOffset;
      const twoSecondsAgo = currentTimestamp - (2 * oneSecond);
      const oneSecondAgo = currentTimestamp - oneSecond;
      const oneSecondLater = currentTimestamp + oneSecond;
      const twoSecondsLater = currentTimestamp + (2 * oneSecond);
      featureToggleOutOfRange = {
        values: [{
          from: moment(twoSecondsAgo).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(oneSecondAgo).format('YYYY-MM-DD HH:mm:ss'),
        }, {
          from: moment(oneSecondLater).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(twoSecondsLater).format('YYYY-MM-DD HH:mm:ss'),
        }],
      };
      featureToggleInRange = {
        values: [{
          from: moment(oneSecondAgo).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(oneSecondLater).format('YYYY-MM-DD HH:mm:ss'),
        }],
      };
    });

    it('works as expected', () => {
      expect(handleScheduleToggle(featureToggleOutOfRange)).to.be.false;
      expect(handleScheduleToggle(featureToggleInRange)).to.be.true;
    });
  });

  describe('.handleVariantToggle()', () => {
    const handleVariantToggle = parserHandlers.variant;
    let variantTestCase;
    let variantTestCasePercentageNot100;

    before(() => {
      variantTestCase = {
        values: [
          {
            value: 'a',
            percentage: 10,
          },
          {
            value: 'b',
            percentage: 35,
          },
          {
            value: 'c',
            percentage: 55,
          },
        ],
      };
      variantTestCasePercentageNot100 = {
        values: [
          {
            value: 1,
            percentage: 99,
          },
        ],
      };
    });

    it('works as expected', () => {
      let resultsCount = {
        a: 0,
        b: 0,
        c: 0,
      };
      for (let i = 0; i < 10000; ++i) {
        resultsCount[handleVariantToggle(variantTestCase)]++;
      }
      variantTestCase.values.forEach((expectedResult) => {
        expect(
          Math.abs(
            Math.floor(resultsCount[expectedResult.value]/100) -
            expectedResult.percentage
          )
        ).to.be.lessThan(6);
      });
    });

    it('throws an error if percentages do not add up to 100', () => {
      expect(() =>
        handleVariantToggle(variantTestCasePercentageNot100)
      ).to.throw();
    });
  });

  describe('.handleAcceptanceToggle()', () => {
    const handleAcceptanceToggle = parserHandlers.acceptance;
    const pivotalConstructor = sinon.spy();
    const verifyStories = sinon.spy();

    context('pivotal integration', () => {
      const acceptanceToggleTestCase = {
        source: 'pivotal',
        state: 'state',
        values: [
          {
            projectId: 'pid',
            storyId: 'sid',
          },
        ],
      };
      const expectedReturnedValue = 'expected';
      let Pivotal;

      before(() => {
        parserHandlers.__set__('_acceptanceHandlers', {
          pivotal: function(...constructorArguments) {
            pivotalConstructor(...constructorArguments);
            return {
              verifyStories: (...verifyStoriesArguments) => {
                verifyStories(...verifyStoriesArguments);
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve({
                      achieved: expectedReturnedValue,
                    });
                  }, 1);
                });
              },
            };
          },
        });
      });

      after(() => {
        parserHandlers.__set__('Pivotal', Pivotal);
      });

      it('works as expected', () =>
        handleAcceptanceToggle(acceptanceToggleTestCase)
          .then((res) => {
            expect(res).to.eql(expectedReturnedValue);
            expect(verifyStories).to.be.calledWith({
              desiredState: acceptanceToggleTestCase.state,
              stories: acceptanceToggleTestCase.values,
            });
          })
      );
    });

    it('throws an error on an unknown source', () =>
      handleAcceptanceToggle({
        source: 'nonsense',
      })
      .then((res) => expect(res).to.not.exist)
      .catch((err) => expect(err).to.exist)
    );
  });

  describe('handleStaticToggle()', () => {
    const handleStaticToggle = parserHandlers.static;

    it('works as expected', () => {
      expect(handleStaticToggle({value: -1})).to.eql(-1);
      expect(handleStaticToggle({value: 1})).to.eql(1);
      expect(handleStaticToggle({value: 0})).to.eql(0);
      expect(handleStaticToggle({value: true})).to.eql(true);
      expect(handleStaticToggle({value: false})).to.eql(false);
      expect(handleStaticToggle({value: '0'})).to.eql('0');
      expect(handleStaticToggle({value: {
        objects: 'work too',
      }})).to.eql({
        objects: 'work too',
      });
    });

    it('throws an error if the value property is undefined', () => {
      expect(() => {
        handleStaticToggle({});
      }).to.throw();
    });
  });
});
