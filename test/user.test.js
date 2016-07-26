// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe("User API (admin)", function(){

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

    describe("GET /users", function(){

        it ("Should return the list of all users", function(done){
            agent.get('/users')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.equal(2);
                    done();
                });
        });

    });

    describe('GET /users/me', function(){

        it('Should return currently logged in user', function(done){
            agent.get('/users/me')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.login).to.be.equal('admin');
                    expect(res.body.displayname).to.be.equal('admin');
                    expect(res.body.type).to.be.equal(1);
                    done();
                });
        });

    });


    describe('GET /users/:userid', function(){
        it ('Should return information on user 2', function(done){
            agent.get('/users/2')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.login).to.be.equal('test');
                    expect(res.body.displayname).to.be.equal('test');
                    expect(res.body.type).to.be.equal(0);
                    done();
                });
        });

        it('Should return code 204 when requesting inexistant user', function(done){
            agent.get('/users/0')
                .end(function(req, res){
                    expect(res).to.have.status(204);
                    done();
                });
        });

    });


    describe('PUT /users/:userid', function(){

        // Normal case
        it('Should update displayname of user 2', function(done){
            agent.get('/users/2')
                .end(function(req, res){
                    var user = res.body;
                    user.displayname = 'updatedName';
                    agent.put('/users/2')
                        .send(user)
                        .end(function(req, res){
                            expect(res).to.have.status(200);

                            agent.get('/users/2')
                                .end(function(req, res){
                                    expect(res.body.displayname).to.be.equal('updatedName');
                                    done();
                                });

                        });
                });
        });

        it ("Should return 404 if userid doesn't exist", function(done){
            agent.get('/users/2')
                .end(function(req, res){
                    var user = res.body;
                    user.id = 0;
                    agent.put('/users/0')
                        .send(res.body)
                        .end(function(req, res){
                            expect(res).to.have.status(404);
                            done();
                        });
                });
        });

        it ('Should fail if user object lacks a parameter', function(done){
            agent.put('/users/2')
                .send({ displayname: 'test' }) // type and id should be specified too
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    done();
                });
        });

        it ("Should send code 400 if user ids don't match", function(done){
            agent.get('/user/2')
                .end(function(req, res){
                    var user = res.body;
                    user.id = 3;
                    agent.put('/users/2')
                        .send(user)
                        .end(function(req, res){
                            expect(res).to.have.status(400);
                            done();
                        });
                });
        });

        // Reset test db
        after(function(done){
            agent.get('/users/2')
                .end(function(req, res){
                    var user = res.body;
                    user.displayname = 'test';
                    agent.put('/users/2')
                        .send(user)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            done();
                        });
                });
        })

    });

    describe('POST /users', function(){

        it('Should create a new user', function(done){
            var user = {
                login: 'user1',
                displayname: 'User 1',
                type: 0
            };
            agent.post('/users')
                .send(user)
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    agent.get('/users')
                        .end(function(req, res){
                            expect(res.body.length).to.be.equal(3);
                            // Check new user info
                            var userId = res.body.map(function(u){ return u.login }).indexOf('user1');
                            expect(res.body[userId].displayname).to.be.equal('User 1');
                            expect(res.body[userId].type).to.be.equal(0);
                            done();
                        });
                });
        });

        it ('Should fail if user info is incomplete', function(done){
            var user = {
                login: 'user1',
                type: 0
            };
            agent.post('/users')
                .send(user)
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    done();
                });
        });

    });

    describe('DELETE /users/:userid', function(){

        it ('Should delete user1', function(done){
            agent.get('/users')
                .end(function(req, res){
                    // Check new user info
                    var userId = res.body.map(function(u){ return u.login }).indexOf('user1');
                    agent.delete('/users/ ' + res.body[userId].id)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            agent.get('/users')
                                .end(function(req, res){
                                    expect(res.body.length).to.be.equal(2);
                                    done();
                                });
                        });
                });
        });

        it ("Should return 404 if user doesn't exist", function(done){
            agent.delete('/users/0')
                .end(function(req, res){
                    expect(res).to.have.status(404);
                    done();
                });
        });

    });

    after(function(done){
        agent.get('/logout')
            .end(function(req, res){
                done();
            });
    });

});


describe("User API (other users)", function(){

    before(function(done){
        agent.post('/login')
            .send({username: 'test', password: 'test'}) // This user isn't an admin
            .end(function(req, res){
                agent.get('/users/me')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        agent.get('/users/me')
                            .end(function(req, res){
                                expect(res.body.type).to.be.equal(0);
                                done();
                            });
                    });
            });
    });

    describe('PUT /users/me/displayname', function(){

        it ('Should update displayname', function(done){
            agent.put('/users/me/displayname')
                .send({displayname: 'updated'})
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    agent.get('/users/me')
                        .end(function(req, res){
                            expect(res.body.displayname).to.be.equal('updated');
                            done();
                        });
                });
        });

        it('SHould fail if displayname is missing or empty', function(done){
            agent.put('/users/me/displayname')
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    agent.put('/users/me/displayname')
                         .send({displayname: ''})
                         .end(function(req, res){
                            expect(res).to.have.status(400);
                            done();
                        });
                });
        });

        after(function(done){
            agent.put('/users/me/displayname')
                .send({displayname: 'test'})
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    done();
                })
        });

    });

    describe('PUT /users/me/password', function(){

        it ("Should update password", function(done){
            agent.put('/users/me/password')
                .send({oldPassword: 'test', newPassword: 'newpasswd'})
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    agent.get('/logout')
                        .end(function(req, res){ 
                            agent.post('/login')
                                .send({username: 'test', password: 'newpasswd'})
                                .end(function(req, res){
                                    agent.get('/users/me')
                                        .end(function(req, res){
                                            expect(res.body.login).to.be.equal('test');
                                            done();
                                        });
                                });
                        })
                });
        });

        it ("Should fail if oldPassword is wrong", function(done){
            agent.put('/users/me/password')
                .send({oldPassword: 'wrong', newPassword: 'newpasswd'})
                .end(function(req, res){
                    expect(res).to.have.status(401);
                    done();
                });
        });

        it ("Should fail if one argument is missing", function(done){
            agent.put('/users/me/password')
                .send({newPassword: 'updated'})
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    agent.put('/users/me/password')
                        .send({oldPassword: 'updated'})
                        .end(function(req, res){
                            expect(res).to.have.status(400);
                            done();
                        });
                });
        });

        after(function(done){
            agent.put('/users/me/password')
                .send({oldPassword: 'newpasswd', newPassword: 'test'})
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    done();
                });
        });

    });

});

describe("Password reset", function(){

    beforeEach(function(done){
        agent.post('/login')
            .send({username: 'admin', password: 'admin'})
            .end(function(req, res){

                expect(res).to.have.status(200);
                done();
            });
    });

     it ("Should reset password of user 2", function(done){
        agent.post('/users/2/resetPassword')
            .end(function(req, res){
                expect(res).to.have.status(200);
                agent.get('/logout')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        agent.post('/login')
                            .send({username: 'test', password: ' '})
                            .end(function(req, res){
                                expect(res).to.have.status(200);
                                agent.get('/users/me')
                                    .end(function(req, res){
                                        expect(res.body.shouldChangePassword).to.be.equal(1);
                                        agent.put('/users/me/password')
                                            .send({oldPassword: '', newPassword: 'test'})
                                            .end(function(req, res){
                                                expect(res).to.have.status(200);
                                                done();
                                            });
                                    });
                            });
                    });
            }); 
    });

     it ("Should send 404 if userid doesn't exist", function(done){
        agent.post('/users/0/resetPassword')
            .end(function(req, res){
                expect(res).to.have.status(404);
                done();
            });
     });

});



