'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Student = mongoose.model('Student');

/**
 * Globals
 */
var student1, student2;

/**
 * Unit tests
 */
describe('Student Model Unit Tests:', function () {

    before(function () {
        student1 = {
            userId: 'userId1',
            userName: 'userName1',
            parentsId: 'parentsId'
        };
        // parents2 is a clone of parents1
        student2 = {
            userId: 'userId2',
            userName: 'userName2',
            parentsId: 'parentsId'
        };

    });

    describe('Method Save', function () {
        it('should begin with no student', function (done) {
            Student.find({}, function (err, student) {
                student.should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function (done) {
            var _student1 = new Student(student1);

            _student1.save(function (err) {
                should.not.exist(err);
                _student1.remove(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should fail to save an existing student again', function (done) {
            var _student1 = new Student(student1);
            var _student2 = new Student(student1);

            _student1.save(function () {
                _student2.save(function (err) {
                    should.exist(err);
                    _student1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should fail to save existing userId', function (done) {
            var _student1 = new Student(student1);
            var _student2 = new Student(student2);

            _student2.userId = _student1.userId;

            _student1.save(function () {
                _student2.save(function (err) {
                    should.exist(err);
                    _student1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should fail to save existing userName', function (done) {
            var _student1 = new Student(student1);
            var _student2 = new Student(student2);

            _student2.userName = _student1.userName;

            _student1.save(function () {
                _student2.save(function (err) {
                    should.exist(err);
                    _student1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should be able to save distinct students', function (done) {
            var _student1 = new Student(student1);
            var _student2 = new Student(student2);

            _student1.save(function () {
                _student2.save(function (err) {
                    should.not.exist(err);
                    _student1.remove(function (err) {
                        should.not.exist(err);
                    });
                    _student2.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });
    });

    after(function (done) {
        Student.remove().exec(done);
    });
});
