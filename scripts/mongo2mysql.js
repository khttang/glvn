var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Registration = mongoose.model('Registration');

    var pool      =    mysql.createPool({
        connectionLimit : 20,
        host     : 'localhost',
        user     : 'root',
        password : 'P@ssw0rd',
        database : 'glvn',
        debug    :  false
    });

    var insert_household = 'INSERT INTO HouseHold (FatherFirst, FatherLast, MotherFirst, MotherLast, Address, City, Postal) VALUES (?,?,?,?,?,?,?)';
    var insert_student = 'INSERT INTO Student (HouseHold, StudentId, Status, SaintName, FirstName, LastName, MiddleName, Gender, BirthDate, Created, Updated) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())';
    var insert_phone = 'INSERT INTO Phone (HouseHold, Owner, Type, StudentId, Number, Status) VALUES(?,?,?,?,?,?)';
    var insert_email = 'INSERT INTO Email (HouseHold, Owner, StudentId, Address, Status) VALUES(?,?,?,?,?)';
    var insert_registration = 'INSERT INTO Registration (StudentId, Year, GradeLevel, GlClass, VnClass, Status, RegExempt, ReceivedBy, ReviewedBy, Received, Reviewed) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
    var mapUsers = new Map();
    var mapPhones = new Map();
    var mapEmails = new Map();
    var mapHouseholds = new Map();

    User.find({'userType': 'STUDENT'}, function (err, users) {
        if (!err) {
            for (var i = 0, len = users.length; i < len; i++) {
                key = users[i].fatherFirstName+','+users[i].fatherLastName+','+users[i].motherFirstName+','+users[i].motherLastName;

                var u = mapUsers.get(key);
                if (u !== undefined) {
                    var diff = false;
                    if (u.address !== users[i].address) {
                        console.log('different address: ' + key + '    ' + users[i].username);
                        diff = true;
                    }
                    if (u.city != users[i].city) {
                        console.log('different city: ' + key + '    ' + users[i].city);
                        diff = true;
                    }
                    if (u.zipCode != users[i].zipCode) {
                        console.log('different zipCode: ' + key + '    ' + users[i].zipCode);
                        diff = true;
                    }

                    if (diff) {
                        console.log('Error - mismatched contact');
                    }
                } else {
                    mapUsers.set(users[i].username, users[i]);
                    mapHouseholds.set(key, {
                        fatherFirstName: users[i].fatherFirstName,
                        fatherLastName: users[i].fatherLastName,
                        motherFirstName: users[i].motherFirstName,
                        motherLastName: users[i].motherLastName,
                        address: users[i].address,
                        city: users[i].city,
                        postal: users[i].zipCode,
                        householdId: -1
                    });

                    for (var j = 0, len2 = users[i].phones.length; j < len2; j++) {
                        mapPhones.set(key+':'+users[i].phones[j].owner, {
                            studentId: users[i].username,
                            status: users[i].phones[j].status,
                            type: users[i].phones[j].type,
                            owner: users[i].phones[j].owner,
                            number: users[i].phones[j].number
                        });
                    }
                    for (var k = 0, len3 = users[i].emails.length; k < len3; k++) {
                        mapEmails.set(key+':'+users[i].emails[k].owner, {
                            studentId: users[i].username,
                            status: users[i].emails[k].status,
                            owner: users[i].emails[k].owner,
                            address: users[i].emails[k].address
                        });
                    }
                }
            }

            //insertHouseholds();
            //insertStudents();
            //insertPhones();
            //insertEmails();
            //insertRegistrations();
        }
    });

    insertHouseholds = function() {
        pool.getConnection(function(err,connection) {
            if (!err) {
                mapHouseholds.forEach(function(value, key) {
                    connection.query(insert_household, [value.fatherFirstName,value.fatherLastName,value.motherFirstName,value.motherLastName,value.address,value.city,value.postal], function (err, result) {
                        if (!err) {
                            value.householdId = result.insertId;
                            console.log(value.householdId);
                        } else {
                            console.log(err);
                        }
                    });
                });
            }
        });
    };

    insertStudents = function() {
        pool.getConnection(function (err, connection) {
            if (!err) {
                mapUsers.forEach(function(value, key) {
                    var sql = 'SELECT id FROM Household WHERE FatherFirst=\''+value.fatherFirstName+
                    '\' AND FatherLast=\''+value.fatherLastName+'\' AND MotherFirst=\''+value.motherFirstName+'\' AND MotherLast=\''+value.motherLastName+'\'';

                    connection.query(sql, function (err, rows) {
                        if (rows !== undefined) {
                            var houseHoldId = rows[0].id;
                            connection.query(insert_student, [houseHoldId,value.username,value.status,value.saintName,value.firstName,value.lastName,value.middleName,value.gender,value.birthDate], function (err, result) {
                                if (err) {
                                    console.log(err);
                                    console.log('Fix me');
                                }
                            });
                        }
                    });
                });
            }
        });
    };

    insertPhones = function() {
        pool.getConnection(function (err, connection) {
            if (!err) {
                mapPhones.forEach(function(value, key) {
                    var parts = key.split(':');
                    var houseHoldKeys = parts[0].split(',');
                    var sql = 'SELECT id FROM Household WHERE FatherFirst=\'' + houseHoldKeys[0] +
                        '\' AND FatherLast=\'' + houseHoldKeys[1] + '\' AND MotherFirst=\'' + houseHoldKeys[2] + '\' AND MotherLast=\'' + houseHoldKeys[3] + '\'';

                    connection.query(sql, function (err, rows) {
                        if (rows !== undefined) {
                            var houseHoldId = rows[0].id;
                            connection.query(insert_phone, [houseHoldId,value.owner,value.type,value.studentId,value.number,value.status], function (err, result) {
                                if (err) {
                                    console.log(err);
                                    console.log('Fix me');
                                }
                            });
                        }
                    });
                });
            }
        });
    };

    insertEmails = function() {
        pool.getConnection(function (err, connection) {
            if (!err) {
                mapEmails.forEach(function(value, key) {
                    var parts = key.split(':');
                    var houseHoldKeys = parts[0].split(',');
                    var sql = 'SELECT id FROM Household WHERE FatherFirst=\'' + houseHoldKeys[0] +
                        '\' AND FatherLast=\'' + houseHoldKeys[1] + '\' AND MotherFirst=\'' + houseHoldKeys[2] + '\' AND MotherLast=\'' + houseHoldKeys[3] + '\'';

                    connection.query(sql, function (err, rows) {
                        if (rows !== undefined) {
                            var houseHoldId = rows[0].id;
                            connection.query(insert_email, [houseHoldId,value.owner,value.studentId,value.address,value.status], function (err, result) {
                                if (err) {
                                    console.log(err);
                                    console.log('Fix me');
                                }
                            });
                        }
                    });
                });
            }
        });
    };

    insertRegistrations = function() {
        Registration.find({}, function (err, registrations) {
            if (!err) {
                pool.getConnection(function (err, connection) {
                    if (!err) {
                        for (var i = 0, len = registrations.length; i < len; i++) {
                            var value = registrations[i];
                            // StudentId, Year, GradeLevel, GlClass, VnClass, Status, RegExempt, ReceivedBy, ReviewedBy, Received, Reviewed
                            var received = (value.received === undefined) ? new Date() : value.received;
                            var reviewed = (value.reviewed === undefined) ? received : value.reviewed;
                            var grade = (value.schoolGrade === null) ? 0 : parseInt(value.schoolGrade);

                            if (value.year === 2015) {
                                if (value.schoolGrade === undefined || value.schoolGrade === null) {
                                    grade = 0;
                                }
                            }

                            connection.query(insert_registration,[value.studentId, value.year, grade, value.glClass, value.vnClass, value.status, value.regTeacherExempt, value.receivedBy, value.reviewedBy, received, reviewed], function (err, result) {
                                if (err) {
                                    if (err.code !== 'ER_DUP_ENTRY') {
                                        console.log(err);
                                        console.log('Fix me: '+this.sql);
                                    }
                                }
                            });
                        }
                    }
                });
            };
        });
    }
});
