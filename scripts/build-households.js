/**
 * Created by ktang on 4/9/17.
 */

var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Household = mongoose.model('Household');
    var HouseholdStudent = mongoose.model('HouseholdStudent');

    var mapHouseholds = new Map();

    User.find({'userType': 'STUDENT'}, function (err, users) {
        if (!err) {
            for (var i = 0, len = users.length; i < len; i++) {

                key = users[i].fatherFirstName+','+users[i].fatherLastName+','+users[i].motherFirstName+','+users[i].motherLastName;
                mapHouseholds.set(key, {
                    fatherFirstName: users[i].fatherFirstName,
                    fatherLastName: users[i].fatherLastName,
                    motherFirstName: users[i].motherFirstName,
                    motherLastName: users[i].motherLastName,
                    address: users[i].address,
                    city: users[i].city,
                    zipCode: users[i].zipCode
                });
            }

            mapHouseholds.forEach(function(value, key) {

                Household.find(value, function (err, houses) {
                   if (!err) {
                       if (houses.length === 0) {
                           var household = new Household(value);
                           household.save(function (err) {
                               if (err) {
                                   throw new Error("Can't save household: " + err);
                               }
                           });
                       }
                   }
                });
            });

            for (var j = 0, len = users.length; j < len; j++) {
                household = {
                    fatherFirstName: users[j].fatherFirstName,
                    fatherLastName: users[j].fatherLastName,
                    motherFirstName: users[j].motherFirstName,
                    motherLastName: users[j].motherLastName,
                    address: users[j].address,
                    city: users[j].city,
                    zipCode: users[j].zipCode
                };
                var username = users[j].username;
                Household.find(household, function (err, houses) {
                    if (!err) {
                        if (houses.length > 0) {
                            householdmap = new HouseholdStudent({'houseHoldId':houses[0]._id,'studentId':username});
                            householdmap.save(function (err) {
                                if (err) {
                                    throw new Error("Can't save household: " + err);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});
