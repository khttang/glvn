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

exports.register = function (req, res) {
    var _user = req.body;
    var currentDt = new Date().now;
    var regYear = dateFormat(currentDt, "yyyy");

    if (_user) {
        var _username = _user.firstName.charAt(0) + dateFormat(_user.birthDate, "mmddyyyy") + _user.lastName.charAt(0);
        User.find({ username: _username}).populate('user', 'username').exec(function (err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (users !== null && users.length > 0) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage("username "+_username+" already exists.")
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
            phones: _user.phones
        });

        var parents = new Parents({
            fatherFirstName: _user.fatherFirstName,
            fatherLastName: _user.fatherLastName,
            motherFirstName: _user.motherFirstName,
            motherLastName: _user.motherLastName
        });
        parents.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
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
            userId: user._id,
            parentsId: parents._id
        });
        student.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
        var registration = new Registration({
            studentId: student._id,
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

exports.create = function (req, res) {
  var user = req.body;

  if (user) {
    var myUser = new User({
      saintName: user.saintName,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      gender: user.gender,
      birthDate: user.birthDate,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode
    });

    /*
    myUser.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(user);
      }
    });
    */
    res.json(myUser);
  } else {
    res.status(400).send({
      message: 'User is not provided'
    });
  }
};

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
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
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
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
