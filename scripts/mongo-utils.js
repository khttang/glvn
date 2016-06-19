var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.connect(function (db) {

    /*
    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');

    var text = fs.readFileSync('/Users/ktang/Personal/Khiem/GLVN/WebProject/export/enrollment_2016-latest-export.json', 'utf8');
    var importJson = JSON.parse(text);

    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var user = new User(data.user);
        user.save(function (err) {
            if (err) {
                throw new Error("Can't save user: "+ err);
            }
        });
    }

    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var student = new Student(data.student);
        student.save(function (err) {
            if (err) {
                throw new Error("Can't save student: " + err);
            }
        });
    }

    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var registration = new Registration(data.registration);
        registration.save(function (err) {
            if (err) {
                throw new Error("Can't save registration: " + err);
            }
        });
    }
    */
    
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'P@ssw0rd',
        database: 'glvn'
    })

    connection.connect(function(err) {
        if (err) throw err;
        console.log('You are now connected...')
    })
});
