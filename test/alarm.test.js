// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../server/main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe('Alarm API', function(){

    before(function(done){
        agent.post('/login')
            .send({username: 'admin', password: 'admin'})
            .end(function(req, res){
                agent.get('/users/me')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    describe('GET /alarms', function(){

        it ('Should return all alarms', function(done){
            agent.get('/alarms')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(3);
                    done();
                });
        });

        it ('Should return not handled alarms', function(done){
            agent.get('/alarms?handled=0')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(2);
                    done();
                });
        });

        it ('Should return alarms for camera Cam_1', function(done){
            agent.get('/alarms?cameraname=Cam_1')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(1);
                    expect(res.body[0].timestamp).to.be.equal(1470391066);
                    done();
                });
        });

    })

});