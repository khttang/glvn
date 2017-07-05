/**
 * Created by ktang on 4/10/17.
 */

var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.connect(function (db) {

    let User = mongoose.model('User');
    let Household = mongoose.model('Household');
    let HouseholdStudent = mongoose.model('HouseholdStudent');


    Household.find(function(err, households) {
        /*
        var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/households.txt");
        stream.once('open', function (fd) {
            stream.write('FatherFirst|FatherLast|MotherFirst|MotherLast|Address|City|Zip\n');

            for (var i = 0, len = houses.length; i < len; i++) {
                stream.write(
                    houses[i].fatherFirstName + '|' + houses[i].fatherLastName + '|' +
                    houses[i].motherFirstName + '|' + houses[i].motherLastName + '|' +
                    houses[i].address + '|' + houses[i].city + '|' + houses[i].zipCode + '\n'
                );
            }
            stream.end();
        });
        */

        User.find(function(err, users) {
            for (var i = 0, len1 = users.length; i < len1; i++) {
                userKey = users[i].fatherFirstName + '|' + users[i].fatherLastName + '|' +
                    users[i].motherFirstName + '|' + users[i].motherLastName + '|' +
                    users[i].address + '|' + users[i].city + '|' + users[i].zipCode;

                for (var j = 0, len2 = houses.length; j < len2; j++) {
                    houseKey = houses[j].fatherFirstName + '|' + houses[j].fatherLastName + '|' +
                        houses[j].motherFirstName + '|' + houses[j].motherLastName + '|' +
                        houses[j].address + '|' + houses[j].city + '|' + houses[j].zipCode;

                    if (userKey === houseKey) {
                        var maphousestudent = new HouseholdStudent({
                            'houseHoldId': houses[j]._id,
                            'studentId': users[i].username
                        });
                        maphousestudent.save(function (err) {
                            if (err) {
                                throw new Error("Can't save household: " + err);
                            }
                        });
                    }
                }
            }

        });

    });
});

