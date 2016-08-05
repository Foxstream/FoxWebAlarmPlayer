// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../server/main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('Testing alarm API', function(){

});