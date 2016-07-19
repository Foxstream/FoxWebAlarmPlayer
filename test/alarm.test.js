process.env.NODE_ENV = 'test';

let server = require('../main.js');
let chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = require('chai').expect;

chai.use(chaiHttp);

describe('AlarmController', function(){

    
    
});