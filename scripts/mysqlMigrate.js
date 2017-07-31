'use strict';

var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

var findChild = function(users, students, id) {
    for (var i = 0, len = users.length; i < len; i++) {
        if (id === users[i].username) {
            let child = {
                username: users[i].username,
                saintName: users[i].saintName,
                lastName: users[i].lastName,
                middleName: users[i].middleName,
                firstName: users[i].firstName,
                gender: users[i].gender,
                birthDate: new Date(users[i].birthDate),
            };

            /*
            for (var j = 0, len2 = students.length; j < len2; j++) {
                if (students[j].studentId === id) {
                    child.hasBaptismCert = students[j].hasBaptismCert;
                    child.baptismDate = students[j].baptismDate;
                    child.baptismPlace = students[j].baptismPlace;
                    break;
                }
            }
            */

            return child;
        }
    }
    return null;
};

mg.loadModels();

mg.connect(function (db) {

    let User = mongoose.model('User');
    let Student = mongoose.model('Student');
    let Registration = mongoose.model('Registration');
    let Household = mongoose.model('Household');
    let HouseholdStudent = mongoose.model('HouseholdStudent');

    Household.find().exec()
        .then(function(households) {
            let result = [];
            return User.find().exec()
                .then(function (users) {
                    return HouseholdStudent.find().exec()
                        .then(function (householdusers) {
                            return Registration.find().exec()
                                .then(function (registrations) {
                                    return Student.find().exec()
                                        .then(function (studetnd) {
                                            return [households, users, householdusers, registrations, students];
                                        });
                                });
                        });
                });
        })
        .then(function(result) {
            let households = result[0];
            let users = result[1];
            let householdusers = result[2];
            let registrations = result[3];
            let students = result[4];
            let output = [];

            for (var i = 0, len1 = households.length; i < len1; i++) {
                let hh = {
                    householdId: households[i]._id.toHexString(),
                    fatherFirstName: households[i].fatherFirstName,
                    fatherLastName: households[i].fatherLastName,
                    motherFirstName: households[i].motherFirstName,
                    motherLastName: households[i].motherLastName,
                    address: households[i].address,
                    city: households[i].city,
                    zipCode: households[i].zipCode,
                    emails: households[i].emails,
                    phones: households[i].phones
                };
                hh.children = [];
                for (var j = 0, len2 = householdusers.length; j < len2; j++) {
                    if (householdusers[j].houseHoldId === households[i]._id.toHexString()) {
                        let child = findChild(users, students, householdusers[j].studentId);
                        if (child !== null) {
                            child.registrations = [];
                            for (var k = 0, len3 = registrations.length; k < len3; k++) {
                                if (registrations[k].studentId === child.username) {
                                    child.registrations.push(registrations[k]);
                                }
                            }
                            hh.children.push(child);
                        }
                    }
                }
                output.push(hh);
            }

            output.foreach(function(household) {
                console.log(household.address);
            });
        });
});
