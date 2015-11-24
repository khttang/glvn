'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Registration = mongoose.model('Registration');

/**
 * Globals
 */
var registration1, registration2;

/**
 * Unit tests
 */
describe('Registration Model Unit Tests:', function () {

    before(function () {
        registration1 = {
            studentId: 'studentId1',
            year: 2016,
            glClass: 'pre-con',
            vnClass: 'vn-08',
            receivedBy: 'Khiem Tang'
        };
        // parents2 is a clone of parents1
        registration2 = {
            studentId: 'studentId2',
            year: 2016,
            glClass: 'pre-con',
            vnClass: 'vn-08',
            receivedBy: 'Khiem Tang'
        };

    });

    describe('Method Save', function () {
        it('should begin with no registration', function (done) {
            Registration.find({}, function (err, reg) {
                reg.should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function (done) {
            var _registration1 = new Registration(registration1);

            _registration1.save(function (err) {
                should.not.exist(err);
                _registration1.remove(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should not be able to register the same student more than once per year', function (done) {
            var _registration1 = new Registration(registration1);
            var _registration2 = new Registration(registration1);

            _registration1.save(function (err) {
                should.not.exist(err);

                _registration2.save(function (err) {
                    should.exist(err);

                    _registration1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should be able to register the same student in different years', function (done) {
            var _registration1 = new Registration(registration1);
            var _registration2 = new Registration(registration1);
            _registration2.year = 2017;

            _registration1.save(function (err) {
                should.not.exist(err);

                _registration2.save(function (err) {
                    should.not.exist(err);

                    _registration1.remove(function (err) {
                        should.not.exist(err);
                    });

                    _registration2.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });
    });

    after(function (done) {
        Registration.remove().exec(done);
    });
});

