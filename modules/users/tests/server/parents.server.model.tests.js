'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Parents = mongoose.model('Parents');

/**
 * Globals
 */
var parents1, parents2;

/**
 * Unit tests
 */
describe('Parents Model Unit Tests:', function () {

    before(function () {
        parents1 = {
            fatherFirstName: 'fatherFirstName',
            fatherLastName: 'fatherLastName',
            motherFirstName: 'motherFirstName',
            motherLastName: 'motherLastName'
        };
        // parents2 is a clone of parents1
        parents2 = parents1;

    });

    describe('Method Save', function () {
        it('should begin with no parents', function (done) {
            Parents.find({}, function (err, parents) {
                parents.should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function (done) {
            var _parent1 = new Parents(parents1);

            _parent1.save(function (err) {
                should.not.exist(err);
                _parent1.remove(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });
    });

    after(function (done) {
        Parents.remove().exec(done);
    });
});
