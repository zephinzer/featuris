const chai = require('chai');
const moment = require('moment');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
chai.use(require('chai-sinon'));

global.expect = chai.expect;
global.log = {
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
global.moment = moment;
global.sinon = sinon;
global.proxyquire = proxyquire;
