// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

describe('Testing user API', function(){

    describe('Available for all users', function(){

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

        describe('GET me', function(){

            it("Should return the currently logged user", function(done){
                agent.get('/controller/users/me')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body.login).to.be.equal('admin');
                        done();
                    });
            });

        });
    });

    describe('Available for admins only', function(){

        var me;
        before(function(done){
            agent.post('/login')
                .send({username: 'admin', password: 'admin'})
                .end(function(req, res){
                    agent.get('/controller/users/me')
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            expect(res.body.type).to.be.equal(1);
                            me = res.body;
                            done();
                        });
                });
        });

        describe('GET all users', function(){
            it('Should get all registered users', function(done){
                agent.get('/controller/users')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body.length).to.be.equal(2);
                        done();
                    });
            });
        });

        describe('GET :userid', function(){
            
            it('Should return user by id', function(done){
                agent.get('/controller/users/2')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body.login).to.be.equal('test');
                        done();
                    });
            });

            it("Should return empty object when id doesn't exist", function(done){
                agent.get('/controller/users/10')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.deep.equal({});
                        done();
                    });
            });
        });

        describe('PUT updating any user', function(){
            it('Should give admin status to another user', function(done){
                agent.get('/controller/users/2')
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        var testUser = res.body;
                        expect(testUser.type).to.be.equal(0);

                        testUser.type = 1;
                        agent.put('/controller/users')
                            .send(testUser)
                            .end(function(req, res){
                                expect(res).to.have.status(200);
                                expect(res.body).to.deep.equal(testUser);
                                done();
                            });
                    });
            });

        });

        describe('PUT updating oneself', function(){

            it('Should be able to change displayname', function(done){
                me.displayname = 'updatedName';
                agent.put('/controller/users/me')
                    .send(me)
                    .end(function(req, res){
                        expect(res).to.have.status(200);
                        expect(res.body).to.deep.equal(me);

                        // Calling users/me would not check the db
                        agent.get('/controller/users/1')
                            .end(function(req, res){
                                expect(res).to.have.status(200);
                                expect(res.body.displayname).to.be.equal('updatedName');
                                done();
                        });
                    });
            });

        });

        after(function(done){
            agent.get('/controller/users/2')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    var testUser = res.body;
                    expect(testUser.type).to.be.equal(1);
 
                    testUser.type = 0;
                    agent.put('/controller/users')
                        .send(testUser)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            expect(res.body).to.deep.equal(testUser);
                            done();
                        });
                });
        });

    });


    describe('Available for non-admin users', function(){

        var me;

        before(function(done){
            agent.post('/login')
                .send({username: 'test', password: 'test'})
                .end(function(req, res){
                    agent.get('/controller/users/me')
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            expect(res.body.type).to.be.equal(0);
                            me = res.body;
                            done();
                        });
                });
        });

        describe('Non-admin users available routes', function(){

            it ('Should redirect to / when trying to reach admin-reserved routes', function(done){
                var testCount = 0;
                var localCb = function(){
                    testCount++;
                    if (testCount === 6){
                        done();
                    }
                }
                agent.get('/controller/users')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
                agent.get('/controller/users/1')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
                agent.put('/controller/users')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
                agent.post('/controller/users/1/resetpassword')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
                agent.post('/controller/users/new')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
                agent.delete('/controller/users/1')
                    .end(function(req, res){
                        expect(res.redirects).to.be.an('array');
                        expect(res.redirects[0].length).to.be.above(0);
                        localCb();
                    });
            });

        });


    });

});