var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.Promise = require('bluebird');

mg.connect(function (db) {

    let User = mongoose.model('User');
    let Household = mongoose.model('Household');
    let Student = mongoose.model('Student');
    let Registration = mongoose.model('Registration');

    let _username = 'o09112010t';
    let _householdId = '594ccee6f384218c28d50d12';
    let regYear = new Date().getFullYear();

    let _registration = {
        studentId: _username,
        year: regYear,
        glClass: 'gl-5',
        vnClass: 'vn-5',
        schoolGrade: '5',
        receivedBy: 'Khiem Tang',
        regTeacherExempt: false,
        regFee: '100',
        status: 'APPROVED'
    };

    let _inputUser = {
        hasBaptismCert: true,
        baptismPlace: 'Holy Family',
        saintName: 'Joseph',
        firstName: 'OneA',
        lastName: 'Tang',
        householdId: '594ccee6f384218c28d50d12',
        fatherFirstName: 'EddieA',
        motherFirstName: 'TestingA'
    };

    Student.find({'username': _username}).exec()
        .then(function (students) {
            Student.update({'_id':students[0]._id},
                {'$set': {'hasBaptismCert': _inputUser.hasBaptismCert, 'baptismPlace':_inputUser.baptismPlace}}).exec()
                .then(function(retObj) {
                    return User.find({'username': _username}).exec()
                        .then(function(users) {
                            User.update({'_id':users[0]._id},
                                {'$set': {'saintName': _inputUser.saintName, 'firstName':_inputUser.firstName, 'lastName': _inputUser.lastName}}).exec()
                                .then(function(retObj) {
                                    Household.update({'_id':_inputUser.householdId},
                                        {'$set': {'fatherFirstName': _inputUser.fatherFirstName, 'motherFirstName':_inputUser.motherFirstName}}).exec()
                                        .then(function () {
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
                                                comments: _registration.comments,
                                                status: _registration.status
                                            });
                                            registration.save(function (err) {
                                                if (err) {
                                                    Console.log(err);
                                                }
                                            });
                                        })
                                })
                        });
                })
        });
});






