var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
    HashMap = require('hashmap');

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');

    User.find({'userType': 'STUDENT'}, function (err, users) {
        if (!err) {
            var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/all-students.txt");
            stream.once('open', function (fd) {
                stream.write('ID|Gender|FirstName|LastName|BirthDate|FatherName|MotherName\n');
                for (var i = 0, len = users.length; i < len; i++) {
                    stream.write(
                        users[i].username+'|' + users[i].gender +'|'+
                        users[i].lastName + '|' + users[i].firstName + '|' +
                        dateFormat(users[i].birthDate, 'yyyymmdd') + '|' +
                        users[i].fatherLastName + ' ' + users[i].fatherFirstName + '|' +
                        users[i].motherLastName + ' ' + users[i].motherFirstName + '\n');
                }
                stream.end();
            });
        }
    });
});

