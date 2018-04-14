'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    dateFormat = require('dateformat'),
    _jade = require('jade'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Parents = mongoose.model('Parents'),
    Student = mongoose.model('Student'),
    Registration = mongoose.model('Registration'),
    Household = mongoose.model('Household'),
    HouseholdStudent = mongoose.model('HouseholdStudent'),
    procedures = require(path.resolve("./modules/users/server/mysql/admin.procedures")),
    appConfig = require(path.resolve("./config/env/default"));

var smtpOptions = {
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: 'goodshepherdglvn@gmail.com',
        pass: 'gl@ppApr2016VNM@il'
    }
};
var mailTransporter = nodemailer.createTransport(smtpTransport(smtpOptions));


function isPhoneNumber(inputtxt) {
    return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(inputtxt);
}

function isAddress(inputtxt) {
    return /\d{1,5}(\s+[A-Za-z])+/.test(inputtxt);
}

function isFullName(inputtxt) {
    return /[A-Za-z]+(\s+[A-Za-z])+/.test(inputtxt);
}

function getCurrentRegStatus(inpStudents) {
    var regYear = appConfig.glvn_registration.year;
    var outStudents = {};

    for (var student in inpStudents) {
        var outStudent = student;
        var status = Registration.find({ 'studentId': student.username, 'year': regYear }).select('status');
        outStudent.regStatus = status;
        outStudents.push(outStudent);
    }
    return outStudents;
}

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
                    break;
                }
            }
        }
    }

    return family;
}

exports.postGmail = function (req, res) {

    var template = './modules/users/server/templates/registration-receipt.jade';

    var compiledTmpl = _jade.compileFile(template);

    var data = req.body;

    // get html back as a string with the context applied;
    var html = compiledTmpl(data);
    var mailOptions = {
        to: data.contactEmail,
        from: 'goodshepherdglvn@gmail.com',
        subject: data.subject,
        html: html
    };

    mailTransporter.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent.');
        }
    });
};

exports.getRegistrations = function (req, res) {
    var _status = req.query.status;
    var _year = req.query.year;
    var _class = req.query.class;
    var regYear = appConfig.glvn_registration.year;

    if (_status === undefined && _class === undefined) {
        if (_year === undefined) {
            User.find({'userType': 'STUDENT'}, function(err, students) {
                if (err) {
                    res.send(500, err);
                }

                var retStudents = [];
                for (var i = 0, len = students.length; i < len; i++) {
                    var u = students[i];
                    retStudents.push(u);
                }
                Registration.find({}, function(err, registrations) {
                    if (err) {
                        res.send(500, err);
                    }

                    Student.find({}, function(err, progress) {
                        if (err) {
                            res.send(500, err);
                        }

                        for (var i = retStudents.length-1; i >= 0; i--) {
                            retStudents[i].registrations = [];
                            for (var j = 0, len = registrations.length; j < len; j++) {
                                if (retStudents[i].username === registrations[j].studentId && registrations[j].year === regYear) {
                                    retStudents.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        var responseObj = {
                            students: retStudents,
                            registrations: registrations,
                            progress: progress
                        };

                        res.json(responseObj);
                    });
                });
            });
        } else if (_year === 'current') {
            Registration.find({'year': regYear}, {'studentId':1}, function(err, studentIds) {
                if (err) {
                    res.send(500, err);
                }

                var _student_ids = [];
                for (var i = 0, len = studentIds.length; i < len; i++) {
                    _student_ids.push(studentIds[i].studentId);
                }

                User.find(
                    { $and: [
                        {'userType': 'STUDENT'},
                        {'username': { $in: _student_ids }}
                    ]}, function(err, students) {
                        if (err) {
                            res.send(500, err);
                        }

                        Registration.find({'studentId': { $in: _student_ids }}, function(err, registrations) {
                            if (err) {
                                res.send(500, err);
                            }

                            Student.find({'username': { $in: _student_ids }}, function(err, progress) {
                                if (err) {
                                    res.send(500, err);
                                }

                                var responseObj = {
                                    students: students,
                                    registrations: registrations,
                                    progress: progress
                                };

                                res.json(responseObj);
                            });
                        });

                    });
            });
        }
     } else {
        if (_class && _year) {
            Registration.find(
                { $and: [
                    {'year': _year},
                    {'status': 'APPROVED'},
                    { $or: [ { 'glClass': _class }, { 'vnClass': _class } ] }
                ]}, function(err, docs) {
                    if (!err) {
                        res.json(docs);
                    } else {
                        res.send(500, err);
                    }
                });
        } else if (_status) {
            var statuses = JSON.parse(_status);
            Registration.find({'status': { $in: statuses}, 'year': regYear}, function(err, docs) {
                if (!err) {
                    res.json(docs);
                } else {
                    res.send(500, err);
                }
            }).sort({'studentId': 1, 'year':-1});
        } else {
            var _student_ids = JSON.parse(req.query.student_ids);
            if (_year === undefined) {
                Registration.find({ 'studentId': { $in: _student_ids }}, function(err, docs) {
                    if (!err) {
                        res.json(docs);
                    } else {
                        res.send(500, err);
                    }
                }).sort({'studentId': 1, 'year':-1});
            } else if (_year === 'current') {
                Registration.find({ 'studentId': { $in: _student_ids }, 'year': regYear}, function(err, docs) {
                    if (!err) {
                        res.json(docs);
                    } else {
                        res.send(500, err);
                    }
                }).sort({'studentId': 1, 'year':-1});
            } else {
                Registration.find({ 'studentId': { $in: _student_ids }, 'year': _year}, function(err, docs) {
                    if (!err) {
                        res.json(docs);
                    } else {
                        res.send(500, err);
                    }
                }).sort({'studentId': 1, 'year':-1});
            }
        }
    }
};

exports.getProgress = function (req, res) {
    var _student_ids = JSON.parse(req.query.student_ids);
    Student.find({ 'username': { $in: _student_ids }}, function(err, docs) {
        if (!err) {
            res.json(docs);
        } else {
            res.send(500, err);
        }
    });
};

exports.find = function (req, res) {
    let _student_id = req.query.student_id;
    let _household_id = req.query.household_id;
    let _class = req.query.class;
    let _student_ids = req.query.student_ids;
    let _user_type = req.query.user_type;
    let temp;

    if (_student_id) {
        User.find({'username': _student_id, 'userType': 'STUDENT'}).exec()
            .then(function (user) {
                var result = [];
                return Registration.find({'studentId': _student_id}).exec()
                    .then(function (registrations) {
                        return Student.find({'username': _student_id}).exec()
                            .then(function (progress) {
                                return Household.findById(_household_id).exec()
                                    .then(function(hh) {
                                        return [user, registrations, progress, hh];
                                    });
                            });
                    });
            })
            .then(function (result) {
                var dbUser = result[0][0];
                var registrations = result[1];
                var progress = result[2];
                var hh = result[3];
                var regYear = appConfig.glvn_registration.year;
                var emails = (hh.emails !== undefined && hh.emails.length > 0) ? hh.emails:dbUser.emails;
                var phones = (hh.phones !== undefined && hh.phones.length > 0) ? hh.phones:dbUser.phones;

                var user = {
                    _id: dbUser._id.toHexString(),
                    username: dbUser.username,
                    saintName: dbUser.saintName,
                    lastName: dbUser.lastName,
                    middleName: dbUser.middleName,
                    firstName: dbUser.firstName,
                    gender: dbUser.gender,
                    birthDate: new Date(dbUser.birthDate),
                    phones: phones,
                    emails: emails
                };
                user.registrations = [];
                for (var i = 0, len = registrations.length; i < len; i++) {
                    var registration = {
                        _id: registrations[i]._id.toHexString(),
                        year: registrations[i].year,
                        glClass: registrations[i].glClass,
                        vnClass: registrations[i].vnClass,
                        schoolGrade: registrations[i].schoolGrade,
                        receivedBy: registrations[i].receivedBy,
                        regTeacherExempt: registrations[i].regTeacherExempt,
                        regFee: registrations[i].regFee,
                        regPaid: registrations[i].regPaid,
                        regReceipt: registrations[i].regReceipt,
                        status: registrations[i].status
                    };
                    user.registrations.push(registration);

                    if (registration.year === regYear) {
                        user.current_reg = registration;
                    }
                }

                user.hasBaptismCert = progress[0].hasBaptismCert;
                user.baptismDate = progress[0].baptismDate;
                user.baptismPlace = progress[0].baptismPlace;

                res.json(user);
            });
    } else if (_student_ids) {
        var usernames = JSON.parse(_student_ids);
        User.find({ 'username': { $in: usernames }}, function(err, docs) {
            if (!err) {
                res.json(docs);
            } else {
                res.send(500, err);
            }
        });

    } else if (_user_type) {
        User.find({'userType': _user_type}, function(err, docs) {
            if (!err) {
                res.json(docs);
            } else {
                res.send(500, err);
            }
        });
    } else if (_class) {
        Registration.find({'year': _class, 'status': {$in: ['APPROVED', 'RECEIVED']}}).exec()
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
                let outputUsers = [];

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
                                schoolGrade: registrations[i].schoolGrade
                            };

                            var family = findHouseholdByUsername(user.username, households, householdStudents);
                            user.fatherFirstName = family.fatherFirstName;
                            user.fatherLastName = family.fatherLastName;
                            user.motherFirstName = family.motherFirstName;
                            user.motherLastName = family.motherLastName;
                            user.address = family.address;
                            user.city = family.city;
                            user.zipCode = family.zipCode;

                            for (var k = 0, len3 = progress.length; k < len3; k++) {
                                if (user.username === progress[k].username) {
                                    user.hasBaptismCert = progress[k].hasBaptismCert;
                                    break;
                                }
                            }
                            outputUsers.push(user);
                            break;
                        }
                    }
                }

                res.json(outputUsers);
            });
    } else {
        User.find({'userType': 'STUDENT'}).exec()
            .then(function (users) {
                var result = [];
                return Registration.find().exec()
                    .then(function (registrations) {
                        return Student.find().exec()
                            .then(function (progress) {
                                return Household.find().exec()
                                    .then(function (households) {
                                        return HouseholdStudent.find().exec()
                                            .then(function (householdStudents) {
                                                return [users, registrations, progress, households, householdStudents];
                                            });
                                    });
                            });
                    });
            })
            .then(function (result) {
                let users = result[0];
                let registrations = result[1];
                let progress = result[2];
                let households = result[3];
                let householdStudents = result[4];
                let regYear = appConfig.glvn_registration.year;
                let outputUsers = [];

                for (var i = 0, len1 = users.length; i < len1; i++) {
                    var user = {
                        _id: users[i]._id.toHexString(),
                        username: users[i].username,
                        saintName: users[i].saintName,
                        lastName: users[i].lastName,
                        middleName: users[i].middleName,
                        firstName: users[i].firstName,
                        gender: users[i].gender,
                        birthDate: new Date(users[i].birthDate),
                    };
                    user.registrations = [];

                    for (var j = 0, len2 = registrations.length; j < len2; j++) {
                        if (users[i].username === registrations[j].studentId) {
                            var registration = {
                                _id: registrations[j]._id.toHexString(),
                                year: registrations[j].year,
                                glClass: registrations[j].glClass,
                                vnClass: registrations[j].vnClass,
                                schoolGrade: registrations[j].schoolGrade,
                                receivedBy: registrations[j].receivedBy,
                                regTeacherExempt: registrations[j].regTeacherExempt,
                                regFee: registrations[j].regFee,
                                regPaid: registrations[j].regPaid,
                                regReceipt: registrations[j].regReceipt,
                                status: registrations[j].status
                            };
                            user.registrations.push(registration);
                        }
                    }
                    var family = findHouseholdByUsername(user.username, households, householdStudents);
                    user.fatherFirstName = family.fatherFirstName;
                    user.fatherLastName = family.fatherLastName;
                    user.motherFirstName = family.motherFirstName;
                    user.motherLastName = family.motherLastName;
                    user.address = family.address;
                    user.city = family.city;
                    user.zipCode = family.zipCode;

                    for (var k = 0, len3 = progress.length; k < len3; k++) {
                        if (users[i].username === progress[k].username) {
                            user.hasBaptismCert = progress[k].hasBaptismCert;
                            break;
                        }
                    }
                    outputUsers.push(user);
                }

                res.json(outputUsers);
            });
    }
};

exports.addRegistration = function (req, res) {
    var _registration = req.body;
    var regYear = appConfig.glvn_registration.year;

    if (_registration._id === undefined) {

        if (_registration.baptismCert !== undefined) {
            var student = new Student({
                username: _registration.studentId
            });

            if (_registration.baptismCert.startsWith('data:image')) {
                var imageBuffer = decodeBase64Image(_registration.baptismCert);
                student.baptismCert = 'bapcert-'+_registration.studentId+'.png';
                fs.writeFile('./uploads/'+student.baptismCert, imageBuffer.data, function(err){
                    if (err) {
                        return res.status(500).send(err.message);
                    }
                });

                student.baptismDate = _registration.baptismDate;
                student.baptismPlace = _registration.baptismPlace;
                /* Need to come back to figure this out
                student.save(function (err) {
                    if (err) {
                        res.status(400).send(err);
                    }
                });
                */
            }
        }

        var registration = new Registration({
            studentId: _registration.studentId,
            year: regYear,
            glClass: _registration.glClass,
            vnClass: _registration.vnClass,
            schoolGrade: _registration.schoolGrade,
            receivedBy: _registration.receivedBy,
            regTeacherExempt: _registration.regTeacherExempt,
            regFee: _registration.regFee,
            regReceipt: _registration.regReceipt,
            regConfirmEmail: _registration.regConfirmEmail
        });
        registration.save(function (err) {
            if (err) {
                return res.status(400).send(err);
            }

            res.status(200);
        });
    } else {
        _registration.reviewed = new Date();
        Registration.findByIdAndUpdate(_registration._id, _registration, function(err, ret_reg){
            if (err) {
                res.status(400).send(err);
            } else {
                res.json(ret_reg);
            }
        });
    }
};

exports.register = function (req, res, next) {
    var inputUser = req.body;
    var regYear = appConfig.glvn_registration.year;

    if (inputUser) {
        var _username = inputUser.firstName.toLowerCase().charAt(0) + dateFormat(inputUser.birthDate, 'mmddyyyy') + inputUser.lastName.toLowerCase().charAt(0);
        User.find({ username: _username}).populate('user', 'username').exec(function (err, users) {
            if (err) {
                res.status(500).send(err.message);
            }
            if (users !== null && users.length > 0) {
                res.status(400).send('username '+_username+' already exists.');

                // fix user name if name is already taken
                //_username = _username + _user.address.charAt(0) + '2';

            } else {
                // Create a new user
                var user = new User({
                    status: 'PROVISIONED',
                    userType: 'STUDENT',
                    saintName: inputUser.saintName,
                    firstName: inputUser.firstName,
                    lastName: inputUser.lastName,
                    username: _username,
                    password: dateFormat(inputUser.birthDate, 'mmddyyyy'),
                    gender: inputUser.gender,
                    birthDate: inputUser.birthDate,
                    address: inputUser.address,
                    city: inputUser.city,
                    zipCode: inputUser.zipCode,
                    fatherFirstName: inputUser.fatherFirstName,
                    fatherLastName: inputUser.fatherLastName,
                    motherFirstName: inputUser.motherFirstName,
                    motherLastName: inputUser.motherLastName
                });

                for (var i = 0; i < inputUser.emails.length; i++) {
                    user.emails.push(inputUser.emails[i]);
                }
                for (i = 0; i < inputUser.phones.length; i++) {
                    user.phones.push(inputUser.phones[i]);
                }

                user.save(function (err) {
                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    var student = new Student({
                        username: _username
                    });

                    var imageBuffer;

                    // save image to file
                    if (inputUser.picture !== undefined) {
                        if (inputUser.picture.startsWith('data:image')) {
                            imageBuffer = decodeBase64Image(inputUser.picture);
                            student.photo = 'photo-'+_username+'.png';
                            fs.writeFile('./uploads/'+student.photo, imageBuffer.data, function(err){
                                if (err) {
                                    return res.status(500).send(err.message);
                                }
                            });
                        }
                    }
                    if (inputUser.baptismCert !== undefined) {
                        if (inputUser.baptismCert.startsWith('data:image')) {
                            imageBuffer = decodeBase64Image(inputUser.baptismCert);
                            student.baptismCert = 'bapcert-'+_username+'.png';
                            fs.writeFile('./uploads/'+student.baptismCert, imageBuffer.data, function(err){
                                if (err) {
                                    return res.status(500).send(err.message);
                                }
                            });
                        }
                    }

                    student.save(function (err) {
                        if (err) {
                            return next(err);
                        }

                        var registration = new Registration({
                            studentId: _username,
                            year: regYear,
                            glClass: inputUser.current_reg.glClass,
                            vnClass: inputUser.current_reg.vnClass,
                            receivedBy: inputUser.current_reg.receivedBy
                        });
                        registration.save(function (err) {
                            if (err) {
                                return res.status(500).send(err.message);
                            }

                            res.json(_username);
                        });
                    });

                });
            }
        });
    } else {
        res.status(400).send({
            message: 'Registration is not provided'
        });
    }
};

exports.createAdmin = function(req, res, next) {
    var inputUser = req.body;
    // Create a new user
    var user = new User({
        status: 'PROVISIONED',
        userType: inputUser.userType,
        firstName: inputUser.firstName,
        lastName: inputUser.lastName,
        username: inputUser.username.toLowerCase(),
        password: inputUser.password,
        gender: inputUser.gender,
        address: inputUser.address,
        city: inputUser.city,
        zipCode: inputUser.zipCode,
        roles: ['ADMIN']
    });

    for (var i = 0; i < inputUser.emails.length; i++) {
        user.emails.push(inputUser.emails[i]);
    }
    for (i = 0; i < inputUser.phones.length; i++) {
        user.phones.push(inputUser.phones[i]);
    }

    user.save(function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
    });
};

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

/*
Initiated from household registration. Add new student.
Assumptions:
   - household already exist
*/
exports.create = function (req, res, next) {
    var inputUser = req.body;
    var regYear = appConfig.glvn_registration.year;

    if (inputUser) {
        var _username = inputUser.firstName.toLowerCase().charAt(0) + dateFormat(inputUser.birthDate, 'mmddyyyy') + inputUser.lastName.toLowerCase().charAt(0);
        User.find({ username: _username}).populate('user', 'username').exec(function (err, users) {
            if (err) {
                res.status(500).send(err.message);
            }
            if (users !== null && users.length > 0) {
                res.status(400).send('username ' + _username + ' already exists.');

                // fix user name if name is already taken
                //_username = _username + _user.address.charAt(0) + '2';

            } else {
                // Create a new user
                var user = new User({
                    status: 'PROVISIONED',
                    userType: 'STUDENT',
                    saintName: inputUser.saintName,
                    firstName: inputUser.firstName,
                    lastName: inputUser.lastName,
                    username: _username,
                    password: dateFormat(inputUser.birthDate, 'mmddyyyy'),
                    gender: inputUser.gender,
                    birthDate: inputUser.birthDate,
                    emergency: inputUser.emergency,
                    emails: [],
                    phones: []
                });

                for (var i = 0; i < inputUser.emails.length; i++) {
                    user.emails.push(inputUser.emails[i]);
                }
                for (i = 0; i < inputUser.phones.length; i++) {
                    user.phones.push(inputUser.phones[i]);
                }

                user.save().then((doc) => {
                    var progress = new Student({
                        username: _username,
                        hasBaptismCert: inputUser.hasBaptismCert,
                        baptismDate: inputUser.baptismDate,
                        baptismPlace: inputUser.baptismPlace
                    });
                    progress.save().then((u) => {
                        var householdStudent = new HouseholdStudent({
                            houseHoldId: inputUser.householdId,
                            studentId: _username
                        });
                        householdStudent.save().then((hh) => {
                            if (inputUser.current_reg !== undefined) {
                                var registration = new Registration(
                                    {
                                        studentId: _username,
                                        year: regYear,
                                        glClass: inputUser.current_reg.glClass,
                                        vnClass: inputUser.current_reg.vnClass,
                                        schoolGrade: inputUser.current_reg.schoolGrade,
                                        receivedBy: inputUser.current_reg.receivedBy,
                                        regFee: inputUser.current_reg.regFee,
                                        status: inputUser.current_reg.status,
                                        comments: inputUser.comments
                                    });
                                registration.save().then((r) => {
                                    procedures.insertActivity({
                                        subjectId: _username,
                                        subjectType: 'Student',
                                        activityType: 'Create',
                                        activityJson: JSON.stringify(inputUser),
                                        actor: inputUser.actor
                                    });
                                    res.status(200).send();
                                }).catch((err) => {
                                    return res.status(500).send(err);
                                });
                            }
                        }).catch((err) => {
                            return res.status(400).send(err.message);
                        });
                    }).catch((err) => {
                        return res.status(400).send(err.message);
                    });
                }).catch((err) => {
                    return res.status(400).send(err.message);
                });
            }
        });
    } else {
        res.status(400).send('Input user is not provided');
    }
};

/**
 * Update user details.
 * Initiated from household registration, returning student.
 * Submit registration.
 * Current working version
 */
exports.update = function (req, res) {

    var _inputUser = req.body;
    var _registration = req.body.current_reg;
    var _username = _inputUser.username;

    // Do not update key and security related fields
    delete req.body.roles;
    delete req.body.userType;
    delete req.body.username;

    var regYear = appConfig.glvn_registration.year;

    Student.findOneAndUpdate({'username': _username},
        { hasBaptismCert: _inputUser.hasBaptismCert, baptismPlace: _inputUser.baptismPlace, baptismDate:_inputUser.baptismDate}).exec()
        .then(function () {
            User.findOneAndUpdate({'username': _username},
                { saintName: _inputUser.saintName, firstName: _inputUser.firstName, lastName: _inputUser.lastName}).exec()
                .then(function () {
                    Household.findOneAndUpdate({'_id': _inputUser.householdId},
                        {
                            fatherFirstName: _inputUser.fatherFirstName, fatherLastName: _inputUser.fatherLastName,
                            motherFirstName: _inputUser.motherFirstName, motherLastName: _inputUser.motherLastName,
                            address: _inputUser.address, city: _inputUser.city, zipCode: _inputUser.zipCode,
                            emails: _inputUser.emails, phones: _inputUser.phones, emergency: _inputUser.emergency
                        }).exec()
                        .then(function () {
                            if (_registration._id === undefined) {
                                var registration = new Registration({
                                    studentId: _username,
                                    year: regYear,
                                    glClass: _registration.glClass,
                                    vnClass: _registration.vnClass,
                                    schoolGrade: _registration.schoolGrade,
                                    receivedBy: _registration.receivedBy,
                                    regTeacherExempt: _registration.regTeacherExempt,
                                    regFee: _registration.regFee,
                                    status: _registration.status,
                                    comments: _registration.comments
                                });
                                registration.save().then((doc) => {
                                    procedures.insertActivity({
                                        subjectId: _username,
                                        subjectType: 'Registration',
                                        activityType: 'Create',
                                        activityJson: JSON.stringify(doc),
                                        actor: _inputUser.actor
                                    });
                                    res.status(200).send();
                                }).catch((err) => {
                                    return res.status(500).send(err.message);
                                });
                            } else {
                                Registration.findOneAndUpdate({'_id': _registration._id},
                                    {
                                        glClass: _registration.glClass, vnClass: _registration.vnClass, schoolGrade: _registration.schoolGrade,
                                        receivedBy: _registration.receivedBy, regTeacherExempt: _registration.regTeacherExempt,
                                        regFee: _registration.regFee, status: _registration.status
                                    }).exec()
                                    .then((doc) => {
                                        procedures.insertActivity({
                                            subjectId: _username,
                                            subjectType: 'Registration',
                                            activityType: 'Update',
                                            activityJson: JSON.stringify(doc),
                                            actor: _inputUser.actor
                                        });
                                        res.status(200).send();
                                    })
                            }
                        })
                })
        })
        .then(function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;

  if (user) {
    fs.writeFile('./modules/users/client/img/profile/uploads/' + req.files.file.name, req.files.file.buffer, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = 'modules/users/client/img/profile/uploads/' + req.files.file.name;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send(saveError.message);
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

exports.findPhoto = function (req, res) {

    /* Temporarily disable loading photo because this may cause crashing...
    var _type = req.query.type;
    var _username = req.query.username;
    var filePath;

    if (req.user) {
        if (_type === 'student') {
            filePath = './uploads/photo-' + _username + '.png';
        } else if (_type === 'certificate') {
            filePath = './uploads/bapcert-' + _username + '.png';
        }

        var img = fs.readFileSync(filePath);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');

    } else {
        res.status(401).send('Authorization required!');
    }
    */
};


/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
