var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

var getUniqueEmail = function(emails, newEmail) {
    var found = false;
    for (var i = 0, len = emails.length; i < len; i++) {
        if (emails[i].address === newEmail.address) {
            found = true;
            break;
        }
    }

    if (!found) {
        emails.push(newEmail);
    }
};

var getUniquePhone = function(phones, newPhone) {
    var found = false;
    for (var i = 0, len = phones.length; i < len; i++) {
        if (phones[i].number === newPhone.number) {
            found = true;
            break;
        }
    }

    if (!found) {
        phones.push(newPhone);
    }
};

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

mg.connect(function (db) {

    let User = mongoose.model('User');
    let Household = mongoose.model('Household');
    let HouseholdStudent = mongoose.model('HouseholdStudent');

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
            Console.out(output);
        })
});




