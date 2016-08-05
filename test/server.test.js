// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../server/main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe("Server API", function(){

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


    describe("GET /servers", function(){

        it ("Should return the list of all servers", function(done){
            agent.get('/servers')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(2);
                    done();
                });
        });

    });

    describe('GET /servers/:serverid', function(){

        it ('Should return information on server 2', function(done){
            agent.get('/servers/2')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.address).to.be.equal('192.168.0.118');
                    expect(res.body.port).to.be.equal(4000);
                    expect(res.body.description).to.be.equal('PC-Foxstream');
                    done();
                });
        });

        it('Should return code 204 when requesting inexistant server', function(done){
            agent.get('/servers/0')
                .end(function(req, res){
                    expect(res).to.have.status(204);
                    done();
                });
        });

    });

    describe('PUT /servers/:serverid', function(){

        it ('Should update server 1', function(done){
            agent.get('/servers/1')
                .end(function(req, res){
                    var server = res.body;
                    server.address = '1.2.3.4';
                    server.description = 'updatedDescription';
                    server.port = 5000;
                    server.username = 'test';
                    server.password = 'test';
                    agent.put('/servers/1')
                        .send(server)
                        .end(function(req, res){
                            expect(res).to.have.status(200);

                            agent.get('/servers/1')
                                .end(function(req, res){
                                    expect(res.body.address).to.be.equal('1.2.3.4');
                                    expect(res.body.description).to.be.equal('updatedDescription');
                                    expect(res.body.port).to.be.equal(5000);
                                    expect(res.body.username).to.be.equal('test');
                                    expect(res.body.password).to.be.equal('test');
                                    done();
                                });
                            });
                    });
        });

        it ("Should return 404 if serverid doesn't exist", function(done){
            agent.get('/servers/2')
                .end(function(req, res){
                    var server = res.body;
                    server.id = 0;
                    agent.put('/servers/0')
                        .send(res.body)
                        .end(function(req, res){
                            expect(res).to.have.status(404);
                            done();
                        });
                });
        });

        it ('Should fail if server object lacks a parameter', function(done){
            agent.put('/servers/2')
                .send({ description: 'test' })
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    done();
                });
        });

        it ("Should send code 400 if server ids don't match", function(done){
            agent.get('/servers/2')
                .end(function(req, res){
                    var server = res.body;
                    server.id = 3;
                    agent.put('/servers/2')
                        .send(server)
                        .end(function(req, res){
                            expect(res).to.have.status(400);
                            done();
                        });
                });
        });

        after(function(done){
            agent.get('/servers/1')
                .end(function(req, res){
                    var server = res.body;
                    server.address = '192.168.31.20';
                    server.description = 'Foxbox';
                    server.port = 4000;
                    server.username = 'admin';
                    server.password = 'admin';                    
                    agent.put('/servers/1')
                        .send(server)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            done();
                        });
                });
        })

    });
    
});




