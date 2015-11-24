/**
 * Created by ktang on 11/3/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateRegistrationStatus = function (searchStr) {
    var userStatusArray = ['RECEIVED', 'PROCESSING', 'INCOMPLETE', 'APPROVED'];
    return (userStatusArray.indexOf(searchStr) > -1);
};

var validateGLClass = function (searchStr) {
    var glArray = ['gl-01','gl-02','gl-03','gl-04','gl-05','gl-06','gl-07','gl-08','pre-con','confirmation'];
    return (glArray.indexOf(searchStr) > -1);
};

var validateVNClass = function (searchStr) {
    var vnArray = ['vn-01','vn-02','vn-03','vn-04','vn-05','vn-06','vn-07','vn-08','vn-09'];
    return (vnArray.indexOf(searchStr) > -1);
};

/**
 * Registration Schema
 */
var RegistrationSchema = new Schema({
    studentId: {
        type: String,
        trim: true,
        required: 'Please fill in student id'
    },
    year: {
        type: Number,
        required: 'Please fill in year'
    },
    glClass: {
        type: String,
        trim: true,
        validate: [validateGLClass, 'invalid GL class']
    },
    vnClass: {
        type: String,
        trim: true,
        validate: [validateVNClass, 'invalid VN class']
    },
    status: {
        type: String,   // SUBMITTED, PROCESSING, INCOMPLETE, APPROVED
        trim: true,
        default: 'RECEIVED',
        required: 'Please fill in status',
        validate: [validateRegistrationStatus, 'Registration status must be in [RECEIVED, PROCESSING, INCOMPLETE, APPROVED]']
    },
    comments: {
        type: String
    },
    receivedBy: {
        type: String,
        trim: true,
        required: true
    },
    reviewedBy: {
        type: String,
        trim: true
    },
    reviewed: {
        type: Date
    },
    received: {
        type: Date,
        default: Date.now
    }
});

RegistrationSchema.index({studentId: 1, year: 1}, {unique: true});

mongoose.model('Registration', RegistrationSchema);
