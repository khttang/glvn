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

    var maphousestudent = new HouseholdStudent({
        'houseHoldId': '593f880a6610cf6587287c13',
        'studentId': 'j04192009n'
    });
    maphousestudent.save(function (err) {
        if (err) {
            throw new Error("Can't save household: " + err);
        }
    });
});

