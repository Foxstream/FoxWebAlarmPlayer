// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);


describe("User API", function(){

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

        it('Should return code 404 when requesting inexistant user', function(done){
            agent.get('/users/10')
                .end(function(req, res){
                    expect(res).to.have.status(404);
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
                    agent.put('/users/10')
                        .send(res.body)
                        .end(function(req, res){
                            expect(res).to.have.status(404);
                            done();
                        });
                });
        });

        it ('Should fail if user object lacks a parameter', function(done){
            agent.put('/users/2')
                .send({ displayname: 'test' }) // type should be provided
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    done();
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

    describe('PUT /users/me', function(){

        it ('Should update displayname', function(done){
            agent.get('/users/me')
                .end(function(req, res){
                    var me = res.body;
                    me.displayname = 'updated';
                    agent.put('/user/me')
                        .send(me)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                            agent.get('/users/me')
                                .end(function(req, res){
                                    expect(res.displayname).to.be.equal('updated');
                                    done();
                                })
                        });
                });
        });

        it('SHould fail if displayname is missing', function(done){
            agent.put('/users/me')
                .send({})
                .end(function(req, res){
                    expect(res).to.have.status(400);
                    done();
                });
        });


        after(function(done){
            agent.get('/users/me')
                .end(function(req, res){
                    var me = res.body;
                    me.displayname = 'admin';
                    agent.put('/user/me')
                        .send(me)
                        .end(function(req, res){
                            expect(res).to.have.status(200);
                        });
                });
        });

    });

    // describe('POST /users', function(){
    //     it ('Should create a new user', function(done){
    //         var new = {
    //             login: 'newuser',
    //             displayname: 'newuser',
    //             type: 0
    //         };
    //         agent.post('/users')
    //             .send(new)
    //             .end(function(req, res){
    //                 expect(res).to.have.status(200);
    //                 agent.get('/users/3')
    //                     .end(function(req, res)){
    //                         expect(res).to.have.status(200);
    //                         expect(res.body.login).to.be.equal('newuser');
    //                         done();
    //                     });
    //             });
    //     });

    //     it("Should fail if object doesn't have all params", function(done){
    //         agent.post('/users')
    //             .send({login: 'test'})
    //             .end(function(req, res){
    //                 expect(res).to.have.status(400);
    //                 done();
    //             });
    //     });

    // });


});




// describe("Testing password change", function(){


//         // it ('Should fail if password change is asked without old password', function(done){
//         //     agent.get('/users/2')
//         //         .end(function(req, res){
//         //             var user = res.body;
//         //             user.newPassword = 'testpasswd'; // oldPassword should be there too
//         //             agent.put('/users/2')
//         //                 .send(user)
//         //                 .end(function(req, res){
//         //                     expect(res).to.have.status(400);
//         //                     done();
//         //                 });
//         //         });
//         // });

//     before(function(done){
//         agent.post('/login')
//             .send({username: 'admin', password: 'admin'})
//             .end(function(req, res){
//                 agent.get('/users/me')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         done();
//                     });
//             });
//     });

//     it ('Should chnage password', function(done){
//         agent.get('/users/me')
//             .end(function(req, res){
//                 var me = res.body;
//                 me.oldPassword = 'admin';
//                 me.newPassword = 'newpasswd';
//                 agent.put('/users/1')
//                     .send(me)
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);

//                         // Logout and try to log in with new password
//                         agent.post('/logout')
//                             .end(function(req, res){
//                                 agent.post('/login')
//                                     .send({username: 'admin', password: 'newpasswd'})
//                                     .end(function(req, res){
//                                         agent.get('/users/me')
//                                             .end(function(req, res){
//                                                 expect(res).to.have.status(200);
//                                                 done();
//                                             });
//                                     });
//                             });
//                     });
//             });
//     });


//     it ('Should fail if oldPassword is wrong', function(done){
//         agent.get('/users/me')
//             .end(function(req, res){
//                 var me = res.body;
//                 me.oldPassword = 'wrong';
//                 me.newPassword = 'newpasswd';
//                 agent.put('/users/1')
//                     .send(me)
//                     .end(function(req, res){
//                         expect(res).to.have.status(401);
//                         done();
//                     });
//             });
//     });

//     after(function(done){
//         agent.get('/users/me')
//             .end(function(req, res){
//                 var me = res.body;
//                 me.oldPassword = 'newpasswd';
//                 me.newPassword = 'admin';
//                 agent.put('/users/1')
//                     .send(me)
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         done();
//                     });
//         });
//     });

// });


// describe('Testing user API', function(){

//         before(function(done){
//             agent.post('/login')
//                 .send({username: 'admin', password: 'admin'})
//                 .end(function(req, res){
//                     agent.get('/controller/users/me')
//                         .end(function(req, res){
//                             expect(res).to.have.status(200);
//                             done();
//                         });
//                 });
//         });

//         describe('GET me', function(){

//             it("Should return the currently logged user", function(done){
//                 agent.get('/controller/users/me')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         expect(res.body).to.be.an('object');
//                         expect(res.body.login).to.be.equal('admin');
//                         done();
//                     });
//             });

//         });

//     describe('Routes available for admins only', function(){

//         var me;
//         before(function(done){
//             agent.post('/login')
//                 .send({username: 'admin', password: 'admin'})
//                 .end(function(req, res){
//                     agent.get('/controller/users/me')
//                         .end(function(req, res){
//                             expect(res).to.have.status(200);
//                             expect(res.body.type).to.be.equal(1);
//                             me = res.body;
//                             done();
//                         });
//                 });
//         });

//         describe('GET all users', function(){
//             it('Should get all registered users', function(done){
//                 agent.get('/controller/users')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         expect(res.body).to.be.an('array');
//                         expect(res.body.length).to.be.equal(2);
//                         done();
//                     });
//             });
//         });

//         describe('GET :userid', function(){
            
//             it('Should return user by id', function(done){
//                 agent.get('/controller/users/2')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         expect(res.body).to.be.an('object');
//                         expect(res.body.login).to.be.equal('test');
//                         done();
//                     });
//             });

//             it("Should return empty object when id doesn't exist", function(done){
//                 agent.get('/controller/users/10')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         expect(res.body).to.be.an('object');
//                         expect(res.body).to.deep.equal({});
//                         done();
//                     });
//             });
//         });

//         describe('PUT updating any user', function(){

//             it('Should give admin status to another user', function(done){
//                 agent.get('/controller/users/2')
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         var testUser = res.body;
//                         expect(testUser.type).to.be.equal(0);

//                         testUser.type = 1;
//                         agent.put('/controller/users')
//                             .send(testUser)
//                             .end(function(req, res){
//                                 expect(res).to.have.status(200);
//                                 expect(res.body).to.deep.equal(testUser);
//                                 done();
//                             });
//                     });
//             });

//             it('Should reset password of another user', function(){
//                 agent.post('/controller/users/')
//             });

//         });

//         describe('PUT updating oneself', function(){

//             it('Should be able to change displayname', function(done){
//                 me.displayname = 'updatedName';
//                 agent.put('/controller/users/me')
//                     .send(me)
//                     .end(function(req, res){
//                         expect(res).to.have.status(200);
//                         expect(res.body).to.deep.equal(me);

//                         // Calling users/me would not check the db
//                         agent.get('/controller/users/1')
//                             .end(function(req, res){
//                                 expect(res).to.have.status(200);
//                                 expect(res.body.displayname).to.be.equal('updatedName');
//                                 done();
//                         });
//                     });
//             });

//         });

//         after(function(done){
//             agent.get('/controller/users/2')
//                 .end(function(req, res){
//                     expect(res).to.have.status(200);
//                     var testUser = res.body;
//                     expect(testUser.type).to.be.equal(1);
 
//                     testUser.type = 0;
//                     agent.put('/controller/users')
//                         .send(testUser)
//                         .end(function(req, res){
//                             expect(res).to.have.status(200);
//                             expect(res.body).to.deep.equal(testUser);
//                             done();
//                         });
//                 });
//         });

//     });


//     describe('Routes available for non-admin users', function(){

//         var me;

//         before(function(done){
//             agent.post('/login')
//                 .send({username: 'test', password: 'test'})
//                 .end(function(req, res){
//                     agent.get('/controller/users/me')
//                         .end(function(req, res){
//                             expect(res).to.have.status(200);
//                             expect(res.body.type).to.be.equal(0);
//                             me = res.body;
//                             done();
//                         });
//                 });
//         });

//         describe('Non-admin users available routes', function(){

//             it ('Should redirect to / when trying to reach admin-reserved routes', function(done){
//                 var testCount = 0;
//                 var localCb = function(){
//                     testCount++;
//                     if (testCount === 6){
//                         done();
//                     }
//                 }
//                 agent.get('/controller/users')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//                 agent.get('/controller/users/1')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//                 agent.put('/controller/users')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//                 agent.post('/controller/users/1/resetpassword')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//                 agent.post('/controller/users/new')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//                 agent.delete('/controller/users/1')
//                     .end(function(req, res){
//                         expect(res.redirects).to.be.an('array');
//                         expect(res.redirects[0].length).to.be.above(0);
//                         localCb();
//                     });
//             });

//         });


//     });

// });