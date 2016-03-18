'use strict';

var should = require('should'),
    request = require('supertest'),
    dateFormat = require('dateformat'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Student = mongoose.model('Student'),
    Parents = mongoose.model('Parents'),
    Registration = mongoose.model('Registration'),
    express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, admin;

/**
 * User routes tests
 */
describe('Admin Capabilities Unit Tests:', function () {
    before(function () {
        // Get application
        app = express.init(mongoose);
        agent = request.agent(app);

        var bdate = new Date();
        var dayStr = dateFormat(bdate, 'ddmmyyyy');

        // Create user credentials
        credentials = {
            username: 'K' + dayStr + 'T',
            password: 'password'
        };

        // Create a new user
        user = new User({
            status: 'PROVISIONED',
            userType: 'TEACHER',
            saintName: 'Saint Name',
            firstName: 'Full',
            lastName: 'Name',
            username: credentials.username,
            password: credentials.password,
            gender: 'Male',
            birthDate: '01/23/1999',
            address: 'address line1',
            city: 'my city',
            zipCode: '92129'
        });

    });

    describe('Student Registration tests', function () {
        var registration1 = {
            status: 'PROVISIONED',
            userType: 'STUDENT',
            saintName: 'Saint Name',
            firstName: 'Full',
            lastName: 'Name',
            password: 'password',
            gender: 'Male',
            birthDate: '01/23/1999',
            address: 'address line1',
            city: 'my city',
            zipCode: '92129',
            fatherFirstName: 'fatherFirstName',
            fatherLastName: 'fatherLastName',
            motherFirstName: 'motherFirstName',
            motherLastName: 'motherLastName',
            glClass: 'pre-con',
            vnClass: 'vn-08',
            receivedBy: 'Khiem Tang'
        };

        it('should be able to register a student if not admin', function (done) {
            user.save(function () {
                agent.post('/api/users/register')
                    .send(registration1)
                    .expect(200)
                    .end(function (regErr, regRes) {
                        // Handle signin error
                        if (regErr) {
                            return done(regErr);
                        }

                    });

                return done();
            });
        });
    });

    describe('User Signin tests', function () {
        it('should not be able to retrieve a list of users if not admin', function (done) {
            user.save(function () {
                agent.post('/api/auth/signin')
                    .send(credentials)
                    .expect(200)
                    .end(function (signinErr, signinRes) {
                        // Handle signin error
                        if (signinErr) {
                            return done(signinErr);
                        }

                        // Save a new article
                        agent.get('/api/users')
                            .expect(403)
                            .end(function (usersGetErr, usersGetRes) {
                                if (usersGetErr) {
                                    return done(usersGetErr);
                                }


                                return done();
                            });
                    });
            });
        });

        it('should be able to retrieve a list of users if admin', function (done) {
            user.roles = ['GUEST', 'ADMIN'];

            user.save(function () {
                agent.post('/api/auth/signin')
                    .send(credentials)
                    .expect(200)
                    .end(function (signinErr, signinRes) {
                        // Handle signin error
                        if (signinErr) {
                            return done(signinErr);
                        }

                        // Save a new article
                        agent.get('/api/users')
                            .expect(200)
                            .end(function (usersGetErr, usersGetRes) {
                                if (usersGetErr) {
                                    return done(usersGetErr);
                                }

                                usersGetRes.body.should.be.instanceof(Array).and.have.lengthOf(1);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
        });

        after(function (done) {
            Parents.remove().exec();
            User.remove().exec();
            Student.remove().exec();
            Registration.remove().exec(done);
        });
    });
});
