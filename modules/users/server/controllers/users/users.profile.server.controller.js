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
    Registration = mongoose.model('Registration');

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
    var regYear = new Date().getFullYear();
    var outStudents = {};

    for (var student in inpStudents) {
        var outStudent = student;
        var status = Registration.find({ 'studentId': student.username, 'year': regYear }).select('status');
        outStudent.regStatus = status;
        outStudents.push(outStudent);
    }
    return outStudents;
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
    var regYear = new Date().getFullYear();

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
    var _criteria = req.query.criteria;
    var _student_id = req.query.student_id;
    var _class = req.query.class;
    var _student_ids = req.query.student_ids;
    var _user_type = req.query.user_type;
    var temp;

    if (_criteria) {
        if (_criteria.indexOf('@') > 0) {
            User.find({ 'emails.address': _criteria, 'userType': 'STUDENT' }, function(err, docs) {
                if (!err){
                    res.json(docs);
                } else {
                    res.status(500).send(err.message);
                }
            });
        } else if (isPhoneNumber(_criteria)) {
            temp = _criteria.replace(/\D/g,'');
            User.find({ 'phones.number': temp, 'userType': 'STUDENT' }, function(err, docs) {
                if (!err){
                    res.json(docs);
                } else {
                    res.status(500).send(err.message);
                }
            });
        } else if (isAddress(_criteria)) {
            temp = '/.*' + _criteria + '.*/';
            User.find({ 'address': temp, 'userType': 'STUDENT' }, function(err, docs) {
                if (!err){
                    res.json(docs);
                } else {
                    res.status(500).send(err.message);
                }
            });
        } else if (isFullName(_criteria)) {
            var names = _criteria.split(' ');

            User.find({ $or: [
                { $and: [ { 'motherFirstName': names[0] }, { 'motherLastName': names[1] } ] },
                { $and: [ { 'motherFirstName': names[1] }, { 'motherLastName': names[0] } ] },
                { $and: [ { 'fatherFirstName': names[0] }, { 'fatherLastName': names[1] } ] },
                { $and: [ { 'fatherFirstName': names[1] }, { 'fatherLastName': names[0] } ] },
                { $and: [ { 'firstName': names[0] }, { 'lastName': names[1] } ] },
                { $and: [ { 'firstName': names[1] }, { 'lastName': names[0] } ] }
            ]}  , function (err, user) {
                if (!err){
                    res.json(user);
                } else {
                    res.status(500).send(err.message);
                }
            });
        }
    } else if (_student_id) {
        User.find({'username': _student_id, 'userType': 'STUDENT' }, function (err, user) {
            if (!err){
                res.json(user);
            } else {
                res.status(500).send(err.message);
            }
        });
    } else if (_class) {
        /*
        TODO: should handle this case too
         */
        console.log(_class);
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
    } else {
        User.find(function(err, docs) {
            if (!err) {
                res.json(docs);
            } else {
                res.send(500, err);
            }
        });
    }
};

exports.addRegistration = function (req, res) {
    var _registration = req.body;
    var regYear = new Date().getFullYear();

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
    var regYear = new Date().getFullYear();

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

exports.create = function (req, res, next) {
    var inputUser = req.body;
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

                    var student = new Student({username: user.username});
                    student.save(function (err) {
                        if (err) {
                            return res.status(500).send(err.message);
                        }

                        res.json(user);
                    });
                });
            }
        });
    } else {
        res.status(400).send('Input user is not provided');
    }
};

/**
 * Update user details
 */
exports.update = function (req, res) {

    var _registration = req.body.current_reg;
    var _username = req.body.username;

    // Do not update key and security related fields
    delete req.body.roles;
    delete req.body.userType;
    delete req.body.username;
    delete req.body.current_reg;

    var imageBuffer;
    var user = new User(req.body);
    var student = {};
    var saveStudent = false;
    var regYear = new Date().getFullYear();

    // save image to file
    if (req.body.picture !== undefined) {
        if (req.body.picture.startsWith('data:image')) {
            imageBuffer = decodeBase64Image(req.body.picture);
            student.photo = 'photo-' + _username + '.png';
            saveStudent = true;
            fs.writeFile('./uploads/' + student.photo, imageBuffer.data, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
            });
        }
    }

    if (req.body.baptismCert !== undefined) {
        if (req.body.baptismCert.startsWith('data:image')) {
            imageBuffer = decodeBase64Image(req.body.baptismCert);
            student.baptismCert = 'bapcert-' + _username + '.png';
            student.hasBaptismCert = true;
            saveStudent = true;
            fs.writeFile('./uploads/' + student.baptismCert, imageBuffer.data, function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
            });
        }
    }

    if (saveStudent === true) {
        Student.find({'username':_username}, function (err, docs) {
            if (!err) {
                if (docs.length === 0) {
                    var _student = new Student({
                        username: _username,
                        baptismCert: student.baptismCert,
                        hasBaptismCert: student.hasBaptismCert,
                        photo: student.photo
                    });
                    _student.save();
                } else {
                    student._id = docs[0]._id;
                    Student.findByIdAndUpdate(student._id, student, function (err) {
                        if (err) {
                            res.status(400).send(err);
                        }
                    });
                }
            }
        });
    }

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
            regReceipt: _registration.regReceipt,
            regConfirmEmail: _registration.regConfirmEmail,
            comments: _registration.comments
        });
        registration.save(function (err) {
            if (err) {
                return res.status(500).send(err);
            }
        });
    } else {
        Registration.findByIdAndUpdate(_registration._id, _registration, function (err) {
            if (err) {
                res.status(500).send(err);
            }
        });
    }

    User.findByIdAndUpdate(req.body._id, user, function(err, ret_user){
        if (err) {
            res.status(400).send(err);
        } else {
            res.json(ret_user);
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
    var _type = req.query.type;
    var _username = req.query.username;
    var filePath;

    if (req.user) {
        if (_type === 'student') {
            filePath = './uploads/photo-' + _username + '.png';
        } else if (_type === 'certificate') {
            filePath = './uploads/bapcert-' + _username + '.png';
        }
        fs.readFile(filePath, function (err, content) {
            if (err) {
                res.writeHead(400, {'Content-type':'text/html'})
                console.log(err);
                res.end("No such image");
            } else {
                //specify the content type in the response will be an image
                res.writeHead(200,{'Content-type':'image/jpg'});
                res.end(content);
            }
        });
    } else {
        res.status(401).send('Authorization required!');
    }
}


/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
