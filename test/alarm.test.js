// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../server/main.js');

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
                agent.get('/users/me')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    describe('GET all alarms', function(){

        it('Should return all alarms', function(done){
            agent.get('/controller/alarms')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(4);
                    done();
                });
        });

        it('Should return not handled alarms', function(done){
            agent.get('/controller/alarms/nothandled')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(3);
                    done();
                }
            );
        });

    });


    describe('GET alarms with conditions', function(){

        it('Should return alarms created on a specific day', function(done){
            agent.get('/controller/alarms')
                .query({ date: 1468879260 }) // 19/07/2016 (1 alarm in db)
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(1);
                    done();
                }
            );
        });

        it('Should return alarms for a specific site', function(done){
            agent.get('/controller/alarms')
                .query({ sitename: 'Site' })
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(1);
                    done();
                }
            );
        });

        it('Should return alarms for a specific camera', function(done){
            agent.get('/controller/alarms')
                .query({ cameraname: 'Parking_couleur' })
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(2);
                    done();
                }
            );
        });

    });

    describe('GET :alarmid', function(){

        it('Should return alarm with the right id', function(done){
            agent.get('/controller/alarm/1')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.id).to.be.equal(1);
                    done();
                }
            );
        });

        it("Should return empty object when alarm id doesn't exist", function(done){
            agent.get('/controller/alarm/10')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.deep.equal({});
                    done();
                }
            );
        });

    });



});