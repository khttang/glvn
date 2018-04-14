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
                    s.middle = (users[j].middleName != undefined) ? users[j].middleName:'';
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

function findMaxHouseHoldSize(householdStudents) {
    var hshdsizes = new HashMap();
    for (var i = 0, len = householdStudents.length; i < len; i++) {
        if (undefined === hshdsizes.get(householdStudents[i].houseHoldId)) {
            hshdsizes.set(householdStudents[i].houseHoldId, 1);
        } else {
            var count = hshdsizes.get(householdStudents[i].houseHoldId);
            hshdsizes.set(householdStudents[i].houseHoldId, count + 1);
        }
    }

    var maxSize = 0;
    hshdsizes.forEach(function(v,k) {
        if (maxSize < v) {
            maxSize = v;
        }
    });

    return maxSize;
}


mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');
    var Household = mongoose.model('Household');
    var HouseholdStudent = mongoose.model('HouseholdStudent');

    Registration.find({'year': 2017, 'status': {$in: ['APPROVED', 'RECEIVED']}}).exec()
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
            var count = 0;

            console.log('Households: '+ households.length);
            console.log('Students: '+ users.length);

            for (var ii = 0, len = households.length; ii < len; ii++) {
                var fatherName = households[ii].fatherFirstName + ' ' + households[ii].fatherLastName;
                var motherName = households[ii].motherFirstName + ' ' + households[ii].motherLastName;
                var students = findStudentsFromHouseHold(householdStudents, users, registrations, progress, households[ii]._id.toHexString());
                for (var jj = 0, len2 = students.length; jj < len2; jj++) {
                    if (students[jj].glClass !== 'confirmation') {
                        count = count + 1;
                        console.log(
                            students[jj].username+'|'
                            +students[jj].last+' '+students[jj].first+'|'+dateFormat(students[jj].birthDate, 'mm/dd/yyyy')+'|'
                            +households[ii].address+'|'+households[ii].city+'|'+households[ii].zipCode+'|'+students[jj].glClass+'|'+students[jj].vnClass);
                    }
                }
            }
            console.log('Total: '+count);

        });
});
