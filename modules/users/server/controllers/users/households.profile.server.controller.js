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
    Household = mongoose.model('Household'),
    HouseholdStudent = mongoose.model('HouseholdStudent');

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
                    zipCode: households[i].zipCode
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
        })
};

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
            household.save(function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.status(200);
            });
        });
};
