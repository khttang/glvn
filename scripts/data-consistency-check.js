'use strict';

var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
    HashMap = require('hashmap');

function findHouseholdByUsername(username, households, householdStudents) {
    var family = {};

    for (var i = 0, len = householdStudents.length; i < len; i++) {
        if (username === householdStudents[i].studentId) {
            for (var j = 0, len2 = households.length; j < len2; j++) {
                if (householdStudents[i].houseHoldId === households[j]._id.toHexString()) {
                    family.houseHoldId = householdStudents[i].houseHoldId;
                    family.fatherFirstName = households[j].fatherFirstName;
                    family.fatherLastName = households[j].fatherLastName;
                    family.motherFirstName = households[j].motherFirstName;
                    family.motherLastName = households[j].motherLastName;
                    family.address = households[j].address;
                    family.city = households[j].city;
                    family.zipCode = households[j].zipCode;
                    family.phones = households[j].phones;
                    family.emails = households[j].emails;
                    break;
                }
            }
        }
    }

    return family;
}

function findStudentsFromHouseHold(householdStudents, users, registrations, progress, houseHoldId) {
    var students = [];
    for (var i = 0, len = householdStudents.length; i < len; i++) {
        if (houseHoldId === householdStudents[i].houseHoldId) {
            for (var j = 0, len2 = users.length; j < len2; j++) {
                if (householdStudents[i].studentId === users[j].username) {

                    var s = {
                        phones: [],
                        emails: []
                    };

                    s.username = users[j].username;
                    s.first =  users[j].firstName;
                    s.last = users[j].lastName;
                    s.middle = (users[j].middleName !== undefined) ? users[j].middleName:'';
                    s.gender = users[j].gender;
                    s.birthDate = users[j].birthDate;
                    if (users[j].phones.length > 0) {
                        s.phones = users[j].phones;
                    }
                    if (users[j].emails.length > 0) {
                        s.emails = users[j].emails;
                    }

                    for (var k = 0, len3 = registrations.length; k < len3; k++) {
                        if (householdStudents[i].studentId === registrations[k].studentId) {
                            s.vnClass = registrations[k].vnClass;
                            s.glClass = registrations[k].glClass;
                            s.grade = registrations[k].schoolGrade;
                            s.regFee = registrations[k].regFee;
                            break;
                        }
                    }

                    for (var l = 0, len4 = progress.length; l < len4; l++) {
                        if (householdStudents[i].studentId === progress[l].username) {
                            s.hasBaptismCert = progress[l].hasBaptismCert;
                            break;
                        }
                    }

                    if (s.vnClass !== undefined || s.glClass !== undefined) {
                        students.push(s);
                    }
                }
            }
        }
    }
    return students;
}

function findPhone(phones, owner) {
    var number = '';
    for (var i = 0, len = phones.length; i < len; i++) {
        if (phones[i].owner === owner) {
            number = phones[i].number;
        }
    }
    return number;
}

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');
    var Household = mongoose.model('Household');
    var HouseholdStudent = mongoose.model('HouseholdStudent');

    //Registration.find({'year': 2018, 'status': {$in: ['APPROVED', 'RECEIVED']}}).exec()
    Registration.find({'year': 2018}).exec()
        .then(function (registrations) {
            var result = [];
            return User.find({'userType': 'STUDENT'}).exec()
                .then(function (users) {
                    return Student.find().exec()
                        .then(function (progress) {
                            return Household.find().exec()
                                .then(function (households) {
                                    return HouseholdStudent.find().exec()
                                        .then(function (householdStudents) {
                                            return [registrations, users, progress, households, householdStudents];
                                        });
                                });
                        });
                });
        })
        .then(function (result) {
            var registrations = result[0];
            var users = result[1];
            var progress = result[2];
            var households = result[3];
            var householdStudents = result[4];
            var households_cnt = 0;

            var stream = fs.createWriteStream('/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2018-base.txt');
            stream.once('open', function (fd) {

                stream.write('HouseholdId|StudentId|First|Last|gl|vn|Address|City|ZipCode|\n');

                for (var i = 0, len = households.length; i < len; i++) {
                    var students = findStudentsFromHouseHold(householdStudents, users, registrations, progress, households[i]._id.toHexString());
                    //if (students.length === 1 && students[0].glClass === 'confirmation') {
                        // Do nothing
                    //} else if (students.length > 0) {
                        ++households_cnt;
                        for (var j = 0, len2 = students.length; j < len2; j++) {
                            stream.write(
                                households[i]._id.toHexString()+'|'+students[j].username+'|'+students[j].first+'|'+students[j].last+'|'+
                                students[j].glClass+'|'+students[j].vnClass+'|'+students[j].regFee+'|'+
                                households[i].address+'|'+households[i].city+'|'+households[i].zipCode+'\n');
                        }
                    //}
                }
                stream.end();

                console.log('Household count: '+ households_cnt);
            });
        });
});
