'use strict';

var mysql = require('./lib/mysql');


function Glvn() {
    this.lookupByHousehold = function(householdid) {
        connection.acquire(function(err, con) {
            con.query('SELECT Student.HouseHold,Student.LastName,Student.FirstName,Student.BirthDate,Student.StudentId,Registration.Year,Registration.GlClass,Registration.VnClass,Registration.GradeLevel from Registration'
                + 'LEFT JOIN Student ON Student.StudentId=Registration.StudentId'
                + 'WHERE Student.HouseHold=1 order by Registration.GlClass,Student.LastName, Student.FirstName', function(err, result) {
                con.release();
                return result;
            });
        });
    };
}
module.exports = new Glvn();