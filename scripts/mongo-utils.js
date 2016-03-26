var mongoose = require('mongoose'),
    chalk = require('chalk'),
    //config = require('../config/config'),
    mg = require('../config/lib/mongoose');

mg.loadModels();

mg.connect(function (db) {
    var Registration = mongoose.model('Registration');
    var User = mongoose.model('User');

    var studentIds = new Array;
    studentIds.push('T03082002T');
    studentIds.push('T05212008T');

    var test = JSON.stringify(studentIds);
    var test2 = JSON.parse(test);
    Registration.find({ studentId: { $in: test2 }}, function(err, regs) {
        if (err) {
            throw err;
        }
        console.log(regs);
    }).sort({'studentId': 1, 'year':-1});





/*
    User.find().exec(function (err, users) {
        if (err) {
            throw err;
        }

        console.log(chalk.yellow('No users were found.'));
    });
    */
});
