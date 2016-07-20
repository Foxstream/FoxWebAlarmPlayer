// Switch to test environment (uses database test.db)
process.env.NODE_ENV = 'test';

var server = require('../main.js');

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('Testing user API', function(){

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

        // Or should it return nothing ?
        it("Should return empty object when id doesn't exist", function(done){
            agent.get('/controller/users/10')
                .end(function(req, res){
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.deep.equal({});
                    done();
                });
        });

    })

});