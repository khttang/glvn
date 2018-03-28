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

mg.loadModels();

mg.connect(function (db) {

    let User = mongoose.model('User');
    let Student = mongoose.model('Student');
    let Registration = mongoose.model('Registration');
    let Household = mongoose.model('Household');
    let HouseholdStudent = mongoose.model('HouseholdStudent');

    Registration.find({'year': '2017', 'status': {$in: ['APPROVED', 'RECEIVED']}}).exec()
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
            let registrations = result[0];
            let users = result[1];
            let progress = result[2];
            let households = result[3];
            let householdStudents = result[4];
            let registered2017 = [];

            for (var i = 0, len = registrations.length; i < len; i++) {
                for (var j = 0, len2 = users.length; j < len2; j++) {
                    if (users[j].username === registrations[i].studentId) {
                        var user = {
                            _id: users[j]._id.toHexString(),
                            username: users[j].username,
                            saintName: users[j].saintName,
                            lastName: users[j].lastName,
                            middleName: users[j].middleName,
                            firstName: users[j].firstName,
                            gender: users[j].gender,
                            birthDate: new Date(users[j].birthDate),
                            glClass: registrations[i].glClass,
                            vnClass: registrations[i].vnClass,
                            schoolGrade: registrations[i].schoolGrade,
                            regStatus: registrations[i].status,
                            regYear: registrations[i].year
                        };

                        var family = findHouseholdByUsername(user.username, households, householdStudents);
                        user.fatherFirstName = family.fatherFirstName;
                        user.fatherLastName = family.fatherLastName;
                        user.motherFirstName = family.motherFirstName;
                        user.motherLastName = family.motherLastName;
                        user.address = family.address;
                        user.city = family.city;
                        user.zipCode = family.zipCode;
                        user.phones = family.phones;
                        user.emails = family.emails;

                        for (var k = 0, len3 = progress.length; k < len3; k++) {
                            if (user.username === progress[k].username) {
                                user.hasBaptismCert = progress[k].hasBaptismCert;
                                break;
                            }
                        }
                        registered2017.push(user);
                        break;
                    }
                }
            }

            var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2017-emails.txt");
            stream.once('open', function (fd) {
                for (var k = 0, len10 = registered2017.length; k < len10; k++) {
                    for (var l = 0, len11 = registered2017[k].emails.length; l < len11; l++) {
                        stream.write(registered2017[k].emails[l].address+'\n');
                    }
                }
                stream.end();
            });
        });
});
