'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    dateFormat = require('dateformat'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Parents = mongoose.model('Parents'),
    Student = mongoose.model('Student'),
    Registration = mongoose.model('Registration');

function isPhoneNumber(inputtxt) {
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.exec(inputtxt);
    if(phoneno) {
        return true;
    } else {
        return false;
    }
}

function isAddress(inputtxt) {
    return false;
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

exports.getRegistrations = function (req, res) {
    var _student_ids = JSON.parse(req.query.student_ids);
    var _year = req.query.year;

    if (_year === undefined) {
        Registration.find({ 'studentId': { $in: _student_ids }}, function(err, docs) {
            if (!err) {
                res.json(docs);
            } else {
                res.send(500, err);
            }
        }).sort({'studentId': 1, 'year':-1});
    } else if (_year === 'current') {
        var regYear = new Date().getFullYear();
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
};

exports.find = function (req, res) {
    var _criteria = req.query.criteria;
    var _student_id = req.query.student_id;
    var _class = req.query.class;

    if (_criteria) {
        if (_criteria.indexOf('@') > 0) {
            User.find({ 'emails.address': _criteria, 'userType': 'STUDENT' }, function(err, docs) {
                if (!err){
                    res.json(docs);
                } else {throw err;}
            });
        } else if (isPhoneNumber(_criteria)) {
            User.find({ 'phones.number': _criteria, 'userType': 'STUDENT' }, function(err, docs) {
                if (!err){
                    res.json(docs);
                } else {throw err;}
            });

        } /* else if (isAddress(_criteria)) {
            TODO: search by address line
        }*/
    } else if (_student_id) {
        User.findById(_student_id, function (err, user) {
            if (!err){
                console.log(user);
                process.exit();
            } else {throw err;}
        });
    } else if (_class) {
        /*
        TODO: should handle this case too
         */
        console.log(_class);
    } else {
        res.status(400).send({
            message: 'User is not provided'
        });
    }
};

exports.addRegistration = function (req, res) {
    var _registration = req.body;
    var regYear = new Date().getFullYear();

    var registration = new Registration({
        studentId: _registration.studentId,
        year: regYear,
        glClass: _registration.glClass,
        vnClass: _registration.vnClass,
        receivedBy: _registration.receivedBy
    });
    registration.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
}

exports.register = function (req, res) {
    var _user = req.body;
    var regYear = new Date().getFullYear();

    if (_user) {
        var _username = _user.firstName.charAt(0) + dateFormat(_user.birthDate, 'mmddyyyy') + _user.lastName.charAt(0);
        User.find({ username: _username}).populate('user', 'username').exec(function (err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (users !== null && users.length > 0) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage('username '+_username+' already exists.')
                });
                // fix user name if name is already taken
                //_username = _username + _user.address.charAt(0) + '2';
            }
        });

        // Create a new user
        var user = new User({
            status: _user.status,
            userType: _user.userType,
            saintName: _user.saintName,
            firstName: _user.firstName,
            lastName: _user.lastName,
            username: _username,
            password: _user.password,
            gender: _user.gender,
            birthDate: _user.birthDate,
            address: _user.address,
            city: _user.city,
            zipCode: _user.zipCode,
            emails: _user.emails,
            phones: _user.phones,
            fatherFirstName: _user.fatherFirstName,
            fatherLastName: _user.fatherLastName,
            motherFirstName: _user.motherFirstName,
            motherLastName: _user.motherLastName
        });

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
        var student = new Student({
            username: _username,
            userId: user._id
        });
        student.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
        var registration = new Registration({
            studentId: student.username,
            year: regYear,
            glClass: _user.glClass,
            vnClass: _user.vnClass,
            receivedBy: _user.receivedBy
        });
        registration.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'Registration is not provided'
        });
    }
};

function buildUser(inputUser, userType) {
    if (inputUser) {
        var _username = inputUser.firstName.toUpperCase().charAt(0) + dateFormat(inputUser.birthDate, 'mmddyyyy') + inputUser.lastName.toUpperCase().charAt(0);
        User.find({ username: _username}).populate('user', 'username').exec(function (err, users) {
            if (err) {
                throw new Error('Cannot find user');
            }
            if (users !== null && users.length > 0) {
                throw new Error('username '+_username+' already exists.');
            }
                // fix user name if name is already taken
                //_username = _username + _user.address.charAt(0) + '2';
        });

        // Create a new user
        var user = new User({
            status: 'PROVISIONED',
            userType: userType,
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
            //user.emails.push({address: inputUser.emails[i], status: 'UNCONFIRMED'});
            user.emails.push(inputUser.emails[i]);
        }
        for (i = 0; i < inputUser.phones.length; i++) {
            //user.phones.push({number: inputUser.phones[i], status: 'UNCONFIRMED'});
            user.phones.push(inputUser.phones[i]);
        }

        user.save(function (err) {
            if (err) {
                throw new Error(errorHandler.getErrorMessage(err));
            }
        });
        var student = new Student({
            username: _username,
            userId: user._id
        });
        student.save(function (err) {
            if (err) {
                throw new Error(errorHandler.getErrorMessage(err));
            }
        });
    } else {
        throw new Error('Registration is not provided');
    }
}

exports.create = function (req, res) {
    try {
        buildUser(req.body, 'STUDENT');
    } catch(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    }

};

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  //var user = req.user;

  // For security measurement we remove the roles from the req.body object
    delete req.body.roles;
    delete req.body.userType;
    delete req.body.username;
    delete req.body.birthDate;

    var user = new User(req.body);

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
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
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

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
