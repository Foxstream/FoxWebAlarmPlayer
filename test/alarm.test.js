// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe('Alarm API', function(){

    // Safer (default is 2000, sometimes callbacks are called too late and it crashes the tests for no reason)
    this.timeout(10000);
    
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
                    expect(res.body.length).to.be.equal(2);
                    expect(res.body[0].timestamp).to.be.equal(1470391066);
                    expect(res.body[1].timestamp).to.be.equal(1470350141);
                    done();
                });
        });

        it ('Should return alarms for a specific day', function(done){
            agent.get('/alarms?date=1470348000')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(2);
                    expect(res.body[0].timestamp).to.be.equal(1470391066);
                    expect(res.body[1].timestamp).to.be.equal(1470350141);
                    done();
                });
        });

        it ('Should return information on alarm 2', function(done){
            agent.get('/alarms/2')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.timestamp).to.be.equal(1470347866);
                    expect(res.body.cameraname).to.be.equal('Cam_2');
                    expect(res.body.hostname).to.be.equal('Server');
                    expect(res.body.sitename).to.be.equal('Site2');
                    expect(res.body.handled).to.be.equal(1);
                    expect(res.body.nbimages).to.be.equal(25);
                    done();
                });
        });

    })

});