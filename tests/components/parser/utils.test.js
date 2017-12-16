const rewire = require('rewire');
const parserUtils = rewire('../../../components/parser/utils');

describe('components/parser/utils', () => {
  describe('.processFeatureToggle()', () => {
    const {processFeatureToggle} = parserUtils;
    let handlers;
    let handlersMock;
    let handlersSpy = {};

    before(() => {
      handlers = parserUtils.__get__('handlers');
      handlersSpy.constructor = sinon.spy();
      handlersSpy.closure = sinon.spy();
      handlersSpy.closure2 = sinon.spy();
      handlersMock = function(...constructorArgs) {
        handlersSpy.constructor(...constructorArgs);
        return function(...closureArgs) {
          handlersSpy.closure(...closureArgs);
          return 'expected';
        };
      };
      parserUtils.__set__('handlers', handlersMock);
    });

    after(() => {
      parserUtils.__set__('handlers', handlers);
    });

    afterEach(() => {
      Object.keys(handlersSpy).forEach((spyKey) => {
        handlersSpy[spyKey].reset();
      });
    });

    context('featureToggle is an object', () => {
      it('works as expected', () => {
        const featureToggle = {
          type: 'type',
        };
        const returnedValue = processFeatureToggle(featureToggle);
        expect(handlersSpy.constructor).to.be.calledOnce;
        expect(handlersSpy.constructor).to.be.calledWith(featureToggle.type);
        expect(handlersSpy.closure).to.be.calledOnce;
        expect(handlersSpy.closure).to.be.calledWith(featureToggle);
        expect(returnedValue).to.eql('expected');
      });

      it('throws an error if a type property is not specified', () => {
        expect(() => {
          processFeatureToggle({});
        }).to.throw();
      });
    });

    context('featureToggle is not an object', () => {
      it('works as expected', () => {
        expect(processFeatureToggle('a')).to.eql('a');
        expect(processFeatureToggle(1)).to.eql(1);
        expect(processFeatureToggle(1.123456789)).to.eql(1.123456789);
        expect(processFeatureToggle(0)).to.eql(0);
        expect(processFeatureToggle(true)).to.eql(true);
        expect(processFeatureToggle(false)).to.eql(false);
      });
    });
  });

  describe('.verifyFeatureAndGetToggleStatus()', () => {
    const {verifyFeatureAndGetToggleStatus} = parserUtils;
    const handlerReturnValue = 'expected_handler_return_value';
    const feature = {
      testenv_01: 'a',
      testenv_02: {
        type: 'b',
      },
      testenv_03: 'c',
      testenv_04: {
        type: 'd',
      },
    };
    let handlers;
    let handlersMock;
    let handlersSpy = {};

    before(() => {
      handlers = parserUtils.__get__('handlers');
      handlersSpy.constructor = sinon.spy();
      handlersSpy.closure = sinon.spy();
      handlersSpy.closure2 = sinon.spy();
      handlersMock = function(...constructorArgs) {
        handlersSpy.constructor(...constructorArgs);
        return function(...closureArgs) {
          handlersSpy.closure(...closureArgs);
          return handlerReturnValue;
        };
      };
      parserUtils.__set__('handlers', handlersMock);
    });

    after(() => {
      parserUtils.__set__('handlers', handlers);
    });

    afterEach(() => {
      Object.keys(handlersSpy).forEach((spyKey) => {
        handlersSpy[spyKey].reset();
      });
    });

    context('environment not specified', () => {
      it('works as expected', () => {
        return verifyFeatureAndGetToggleStatus(feature)
          .then((result) => {
            expect(result).to.have.keys(Object.keys(feature));
            expect(result.testenv_01.value).to.eql(feature.testenv_01);
            expect(result.testenv_02.value).to.eql(handlerReturnValue);
            expect(result.testenv_03.value).to.eql(feature.testenv_03);
            expect(result.testenv_04.value).to.eql(handlerReturnValue);
          });
      });
    });

    context('environment is specified', () => {
      it('works as expected', () => {
        return verifyFeatureAndGetToggleStatus(feature, 'testenv_01')
          .then((result) => {
            expect(result).to.have.keys('testenv_01');
          });
      });
    });

    it('throws an error if the feature is not an object', () =>
      verifyFeatureAndGetToggleStatus('a')
      .then((response) => {
        if (response) {
          throw new Error('shouldnt reach here');
        }
      })
      .catch(() => {})
    );
  });

  describe('.verifyFeatureKeyAndGetFeature()', () => {
    const {verifyFeatureKeyAndGetFeature} = parserUtils;
    const root = {
      'expected': 'key',
      '1': 'key_1',
      'a': 'key_a',
    };

    it('works as expected', () => {
      expect(verifyFeatureKeyAndGetFeature(root, 'expected')).to.eql('key');
      expect(verifyFeatureKeyAndGetFeature(root, '1')).to.eql('key_1');
      expect(verifyFeatureKeyAndGetFeature(root, 'a')).to.eql('key_a');
    });

    it('throws an error on invalid featureKey', () => {
      expect(() => verifyFeatureKeyAndGetFeature(root, '-')).to.throw();
      expect(() => verifyFeatureKeyAndGetFeature(root, '_')).to.throw();
      expect(() => verifyFeatureKeyAndGetFeature(root, 'a_')).to.throw();
      expect(() => verifyFeatureKeyAndGetFeature(root, 'a-')).to.throw();
      expect(() => verifyFeatureKeyAndGetFeature(root, 'a!')).to.throw();
    });
  });

  describe('.verifyRootAndGetFeatureKeys()', () => {
    const {verifyRootAndGetFeatureKeys} = parserUtils;

    it('works as expected', () => {
      expect(verifyRootAndGetFeatureKeys({})).to.eql([]);
      expect(verifyRootAndGetFeatureKeys({a: 1})).to.eql(['a']);
    });

    it('throws an error when the :root is not an object', () => {
      expect(() => verifyRootAndGetFeatureKeys(1)).to.throw();
      expect(() => verifyRootAndGetFeatureKeys(1.123)).to.throw();
      expect(() => verifyRootAndGetFeatureKeys('a')).to.throw();
      expect(() => verifyRootAndGetFeatureKeys(true)).to.throw();
      expect(() => verifyRootAndGetFeatureKeys({})).to.not.throw();
    });
  });
});
