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

    var registered2016 = new Array();

    Registration.find({
        'year': '2016',
        'status': {$in: ['APPROVED', 'RECEIVED']}
    }, function (err, registrations) {
        if (!err) {
            User.find({'userType': 'STUDENT'}, function (err, users) {
                if (!err) {

                    Student.find({}, function(err, progress) {
                        if (!err) {
                            for (var i = 0, len = users.length; i < len; i++) {
                                var u = users[i];
                                var registered = null;
                                for (var j = 0, len2 = registrations.length; j < len2; j++) {
                                    var reg2016 = registrations[j];
                                    if (u.username === reg2016.studentId) {
                                        u.reg2016 = reg2016;

                                        for (var k = 0, len3 = progress.length; k < len3; k++) {
                                            if (u.username === progress[k].username) {
                                                u.progress = progress[k];
                                                break;
                                            }
                                        }
                                        registered2016.push(u);
                                        break;
                                    }
                                }
                            }

                            var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2016.csv");
                            stream.once('open', function (fd) {
                                stream.write('ID|Status|Gender|FirstName|LastName|BirthDate|FatherName|MotherName|Address|Phone|Email|RegYear|SchoolGrade|VNClass|GLClass|BapCert|RegFee|RegExempt|Check#\n');
                                for (var k = 0, len10 = registered2016.length; k < len10; k++) {
                                    var phoneNumber = (registered2016[k].phones.length > 0 ) ?  registered2016[k].phones[0].number : null;
                                    var emailAddr = (registered2016[k].emails.length > 0) ? registered2016[k].emails[0].address : null;
                                    var gender = registered2016[k].gender[0];
                                    stream.write(
                                        registered2016[k].username+'|' + registered2016[k].reg2016.status+'|'+ gender +'|'+
                                        registered2016[k].firstName + '|' + registered2016[k].lastName + '|' +
                                        dateFormat(registered2016[k].birthDate, 'mm/dd/yyyy') + '|' +
                                        registered2016[k].fatherFirstName + ' ' + registered2016[k].fatherLastName + '|' +
                                        registered2016[k].motherFirstName + ' ' + registered2016[k].motherLastName + '|' +
                                        registered2016[k].address + '|' + phoneNumber + '|' + emailAddr + '|' +
                                        registered2016[k].reg2016.year + '|' + registered2016[k].reg2016.schoolGrade + '|' + registered2016[k].reg2016.vnClass + '|' +
                                        registered2016[k].reg2016.glClass + '|' + registered2016[k].progress.hasBaptismCert + '|' +
                                        registered2016[k].reg2016.regFee + '|' + registered2016[k].reg2016.regTeacherExempt + '|' +
                                        registered2016[k].reg2016.regReceipt + '\n');
                                }
                                stream.end();
                            });
                        }
                    });
                }
            });
        }
    });
});
