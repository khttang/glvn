'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    dateFormat = require('dateformat'),
    _jade = require('jade'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Student = mongoose.model('Student'),
    Household = mongoose.model('Household'),
    Registration = mongoose.model('Registration'),
    HouseholdStudent = mongoose.model('HouseholdStudent'),
    procedures = require(path.resolve('./modules/users/server/mysql/admin.procedures'));

var findChild = function(users, id) {
    for (var i = 0, len = users.length; i < len; i++) {
        if (id === users[i].username) {
            return {
                username: users[i].username,
                fullname: users[i].firstName + ' ' + users[i].lastName
            };
        }
    }
    return null;
};

exports.getHouseHolds = function (req, res) {

    Household.find().exec()
        .then(function(households) {
            var result = [];
            return User.find().exec()
                .then(function (users) {
                    return HouseholdStudent.find().exec()
                        .then(function (householdusers) {
                            return [households, users, householdusers];
                        });
                });
        })
        .then(function(result) {
            var households = result[0];
            var users = result[1];
            var householdusers = result[2];

            var output = [];
            for (var i = 0, len1 = households.length; i < len1; i++) {
                var hh = {
                    householdId: households[i]._id.toHexString(),
                    fatherFirstName: households[i].fatherFirstName,
                    fatherLastName: households[i].fatherLastName,
                    motherFirstName: households[i].motherFirstName,
                    motherLastName: households[i].motherLastName,
                    address: households[i].address,
                    city: households[i].city,
                    zipCode: households[i].zipCode,
                    emails: households[i].emails,
                    phones: households[i].phones,
                    emergency: households[i].emergency
                };
                hh.children = [];
                for (var j = 0, len2 = householdusers.length; j < len2; j++) {
                    if (householdusers[j].houseHoldId === households[i]._id.toHexString()) {
                        var child = findChild(users, householdusers[j].studentId);
                        if (child !== null) {
                            hh.children.push(child);
                        }
                    }
                }
                output.push(hh);
            }
            res.json(output);
        });
};

/*
Initiated from household registration, create a new household.
*/
exports.register = function (req, res) {

    Household.find({ fatherFirstName: req.fatherFirstName, motherFirstName: req.motherFirstName, address: req.address, city: req.city, zipCode: req.zipCode }).populate('user', 'username')
        .exec(function (err, households) {
            if (err) {
                res.status(500).send(err.message);
            }
            if (households !== null && households.length > 0) {
                res.status(400).send('Household is already in the system. Please check again!');
            }

            var household = new Household(req.body);
            household.save().then((doc) => {
                procedures.insertActivity({
                    subjectId: doc._id.toHexString(),
                    subjectType: 'HouseHold',
                    activityType: 'Create',
                    activityJson: JSON.stringify(req.body),
                    actor: req.body.actor
                });
            }).catch((err) => {
                return res.status(500).send(err.message);
            });

            res.status(200).send();
        });
};

/*
    Get all registrations for a specific household.
    Used to populate data for popup payfee.client.view.html
    Invoked from registration.client.controller.js
 */
exports.getRegistrations = function (req, res) {
    let _household_id = req.query.household_id;
    let _regyear = req.query.reg_year;

    HouseholdStudent.find({'houseHoldId':_household_id}).exec()
        .then (function (students) {
            var result = [];
            return Student.find().exec()
                .then(function (progress) {
                    return Registration.find({'year':_regyear}).exec()
                        .then(function (registrations) {
                            return User.find().exec()
                                .then(function(users) {
                                    return [students, progress, registrations, users];
                                });
                        });
                });
        })
        .then(function (result) {
            var students = result[0];
            var progress = result[1];
            var registrations = result[2];
            var users = result[3];
            var output = [];

            for (var i = 0, len1 = registrations.length; i < len1; i++) {
                var retRegistration = {};
                for (var j = 0, len2 = students.length; j < len2; j++) {
                    if (registrations[i].studentId === students[j].studentId) {
                        retRegistration._id = registrations[i]._id.toHexString();
                        retRegistration.schoolGrade = registrations[i].schoolGrade;
                        retRegistration.glClass = registrations[i].glClass;
                        retRegistration.vnClass = registrations[i].vnClass;
                        retRegistration.regFee = registrations[i].regFee;
                        retRegistration.regPaid = (registrations[i].regPaid !== undefined) ? registrations[i].regPaid : null;
                        retRegistration.regTeacherExempt = registrations[i].regTeacherExempt;

                        for (var k = 0, len3 = progress.length; k < len3; k++) {
                            if (students[j].studentId === progress[k].username) {
                                retRegistration.hasBaptismCert = progress[k].hasBaptismCert;
                            }
                        }
                        for (var l = 0, len4 = users.length; l < len4; l++) {
                            if (students[j].studentId === users[l].username) {
                                retRegistration.name = users[l].firstName + ' ' + users[l].lastName;
                            }
                        }
                        output.push(retRegistration);
                    }
                }
            }
            res.json(output);
        });
};

/*
    Submit household payment
 */
exports.submitPayment = function (req, res) {
    let _household = req.body;
    let promises = [];
    let comments = 'Total: '+_household.payment.regFee;
    if (_household.payment.checkNumber !== undefined) {
        comments += ', Chk# '+_household.payment.checkNumber;
    } else {
        comments += ', Cash';
    }
    if (_household.payment.receipt !== undefined) {
        comments += ', Receipt: '+_household.payment.receipt;
    }
    if (_household.payment.comments !== undefined) {
        comments += ', Notes: '+ _household.payment.comments;
    }
    for (var i = 0, len = _household.current_regs.length; i < len; i++) {
        _household.current_regs[i].regPaid = _household.current_regs[i].regFee;
        promises.push(Registration.update({'_id': _household.current_regs[i]._id},
            {
                '$set': {
                    'regTeacherExempt': _household.payment.regTeacherExempt,
                    'regFee': _household.current_regs[i].regFee,
                    'regPaid': _household.current_regs[i].regPaid,
                    'status': _household.current_regs[i].status,
                    'reviewedBy': _household.payment.reviewedBy,
                    'regReceipt': _household.payment.receipt,
                    'comments': comments
                }
            }).exec()
        );
    }
    Promise.all(promises).then(function() {
        var activity = {
            registrations: _household.current_regs,
            payment: _household.payment,
            comments: comments
        };
        procedures.insertActivity({
            subjectId: _household.householdId,
            subjectType: 'HouseHold',
            activityType: 'Pay',
            activityJson: JSON.stringify(activity),
            actor: _household.actor
        });
        res.status(200).send();
    });
};

/*
    Retrieve report
 */
exports.getRegistrationReport = function (req, res) {
    let _regyear = req.query.reg_year;
    procedures.getRegistrationReport(_regyear, function(err, content) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(content);
        }
    });
};