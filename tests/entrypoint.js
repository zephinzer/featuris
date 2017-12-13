const chai = require('chai');
const moment = require('moment');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

global.expect = chai.expect;
global.log = console;
global.moment = moment;
global.sinon = sinon;
global.proxyquire = proxyquire;
