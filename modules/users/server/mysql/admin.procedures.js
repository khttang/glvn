'use strict';

var bcrypt = require('bcrypt-nodejs'),
    mysql  = require('./../../../../config/lib/mysql');

exports.addAdminUser = function(user) {
    let insertQuery = 'INSERT INTO User ( usertype, username, password, roles, canLogin, fullName, email ) values (?,?,?,?,?,?,?)';
    let hashPassword = bcrypt.hashSync(user.password, null, null);
    mysql.pool.query(insertQuery, [user.usertype, user.username, hashPassword, user.roles, true, user.fullName, user.email], function(err, rows) {
        if (err) {
            console.log(err);
        }
    });
};

exports.createStudent = function(student) {

};

exports.updateStudent = function(student) {

};

exports.lookupStudent = function(id) {

};

exports.createHouseHold = function(houseHold) {

};

exports.updateHouseHold = function(houseHold) {

};

exports.insertActivity = function(event) {
    // Do not throw error if this doesn't happen correct. Logging is good enough
    let insertQuery = 'INSERT INTO Activity ( subjectId, subjectType, activityType, activityJson, activityDate, actor) values (?,?,?,?,?,?)';
    mysql.pool.query(insertQuery, [event.subjectId, event.subjectType, event.activityType, event.activityJson, new Date(), event.actor], function(err, rows) {
        if (err) {
            console.log(err);
        }
    });
};

exports.getRegistrationReport = function(year, callback) {
    let lookupQuery = 'SELECT * from Activity where SubjectType=\'HouseHold\' AND ActivityType=\'Pay\' AND YEAR(ActivityDate)='+year+' ORDER BY ActivityDate DESC';
    mysql.pool.query(lookupQuery, function(err, rows) {
        if (err) {
            callback(err, null);
        }
        return callback(null, rows);
    });
};