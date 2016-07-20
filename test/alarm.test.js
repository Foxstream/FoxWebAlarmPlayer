process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('Testing alarm API', function(){

    var agent = chai.request.agent(server);

    before(function(done){
        agent.post('/login')
            .send({username: 'admin', password: 'admin'})
            .end(function(req, res){
                agent.get('/controller/users/me')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    it('Should return all alarms', function(done){
        agent.get('/controller/alarms')
            .end(function(req, res){
                expect(res).to.have.status(200);
                done();
            }
        );
    });

});