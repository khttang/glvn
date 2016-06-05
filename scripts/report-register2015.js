var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
    HashMap = require('hashmap');

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');

    User.find({'userType': 'STUDENT'}, function (err, students) {
        if (err) {
            res.send(500, err);
        }

        var retStudents = [];
        for (var i = 0, len = students.length; i < len; i++) {
            var u = students[i];
            retStudents.push(u);
        }
        Registration.find({}, function (err, registrations) {
            if (err) {
                res.send(500, err);
            }

            Student.find({}, function (err, progress) {
                if (err) {
                    res.send(500, err);
                }

                for (var i = retStudents.length - 1; i >= 0; i--) {
                    for (var j = 0, len = registrations.length; j < len; j++) {
                        if (retStudents[i].username === registrations[j].studentId) {
                            if (registrations[j].year === 2016) {
                                retStudents.splice(i, 1);
                                break;
                            } else {
                                retStudents[i].reg2015 = registrations[j];
                            }
                        }
                    }
                }

                var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2015.csv");
                stream.once('open', function (fd) {
                    stream.write('ID|FirstName|LastName|BirthDate|FatherName|MotherName|Address|Phone|Email|RegYear|SchoolGrade|VNClass|GLClass\n');
                    for (var k = 0, len3 = retStudents.length; k < len3; k++) {
                        var phoneNumber = (retStudents[k].phones.length > 0 ) ?  retStudents[k].phones[0].number : null;
                        var emailAddr = (retStudents[k].emails.length > 0) ? retStudents[k].emails[0].address : null;
                        stream.write(
                            retStudents[k].username+'|'+
                            retStudents[k].firstName + '|' + retStudents[k].lastName + '|' +
                            dateFormat(retStudents[k].birthDate, 'mm/dd/yyyy') + '|' +
                            retStudents[k].fatherFirstName + ' ' + retStudents[k].fatherLastName + '|' +
                            retStudents[k].motherFirstName + ' ' + retStudents[k].motherLastName + '|' +
                            retStudents[k].address + '|' + phoneNumber + '|' + emailAddr + '|' +
                            retStudents[k].reg2015.year + '|' + retStudents[k].reg2015.schoolGrade + '|' + retStudents[k].reg2015.vnClass + '|' +
                            retStudents[k].reg2015.glClass + '\n');
                    }
                    stream.end();
                });
            });
        });
    });
});