var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    fs = require('fs'),
    dateFormat = require('dateformat'),
    HashMap = require('hashmap');

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
                    family.phones = households[j].phones;
                    family.emails = households[j].emails;
                    break;
                }
            }
        }
    }

    return family;
}

function findStudentsFromHouseHold(householdStudents, users, registrations, progress, houseHoldId) {
    var students = [];
    for (var i = 0, len = householdStudents.length; i < len; i++) {
        if (houseHoldId === householdStudents[i].houseHoldId) {
            for (var j = 0, len2 = users.length; j < len2; j++) {
                if (householdStudents[i].studentId === users[j].username) {

                    var s = {
                        phones: [],
                        emails: []
                    };

                    s.username = users[j].username;
                    s.first =  users[j].firstName;
                    s.last = users[j].lastName;
                    s.middle = (users[j].middleName != undefined) ? users[j].middleName:'';
                    s.gender = users[j].gender;
                    s.birthDate = users[j].birthDate;
                    if (users[j].phones.length > 0) {
                        s.phones = users[j].phones;
                    }
                    if (users[j].emails.length > 0) {
                        s.emails = users[j].emails;
                    }

                    for (var k = 0, len3 = registrations.length; k < len3; k++) {
                        if (householdStudents[i].studentId === registrations[k].studentId) {
                            s.vnClass = registrations[k].vnClass;
                            s.glClass = registrations[k].glClass;
                            s.grade = registrations[k].schoolGrade;
                            break;
                        }
                    }

                    for (var l = 0, len4 = progress.length; l < len4; l++) {
                        if (householdStudents[i].studentId === progress[l].username) {
                            s.hasBaptismCert = progress[l].hasBaptismCert;
                            break;
                        }
                    }

                    if (s.vnClass !== undefined || s.glClass !== undefined) {
                        students.push(s);
                    }
                }
            }
        }
    }
    return students;
}

function findPhone(phones, owner) {
    var number = '';
    for (var i = 0, len = phones.length; i < len; i++) {
        if (phones[i].owner === owner) {
            number = phones[i].number;
        }
    }
    return number;
}

function findMaxHouseHoldSize(householdStudents) {
    var hshdsizes = new HashMap();
    for (var i = 0, len = householdStudents.length; i < len; i++) {
        if (undefined === hshdsizes.get(householdStudents[i].houseHoldId)) {
            hshdsizes.set(householdStudents[i].houseHoldId, 1);
        } else {
            var count = hshdsizes.get(householdStudents[i].houseHoldId);
            hshdsizes.set(householdStudents[i].houseHoldId, count + 1);
        }
    }

    var maxSize = 0;
    hshdsizes.forEach(function(v,k) {
       if (maxSize < v) {
           maxSize = v;
       }
    });

    return maxSize;
}

function getCurrentGLLevel(currentGl) {
    if (currentGl === 'gl-01') {
        return 'gl-01';
    }
    if (currentGl === 'gl-02') {
        return 'gl-02';
    }
    if (currentGl === 'gl-03') {
        return 'gl-03';
    }
    if (currentGl === 'gl-04') {
        return 'gl-04';
    }
    if (currentGl === 'gl-05') {
        return 'gl-05';
    }
    if (currentGl === 'gl-06') {
        return 'gl-06';
    }
    if (currentGl === 'gl-07') {
        return 'gl-07';
    }
    if (currentGl === 'gl-08') {
        return 'gl-08';
    }
    if (currentGl === 'pre-con') {
        return 'pre-con';
    }
    if (currentGl === 'confirmation') {
        return 'confirmation';
    }
    return '';
}

function getNextGLLevel(currentGl) {
    if (currentGl === 'gl-01') {
        return 'gl-02';
    }
    if (currentGl === 'gl-02') {
        return 'gl-03';
    }
    if (currentGl === 'gl-03') {
        return 'gl-04';
    }
    if (currentGl === 'gl-04') {
        return 'gl-05';
    }
    if (currentGl === 'gl-05') {
        return 'gl-06';
    }
    if (currentGl === 'gl-06') {
        return 'gl-07';
    }
    if (currentGl === 'gl-07') {
        return 'gl-08';
    }
    if (currentGl === 'gl-08') {
        return 'pre-con';
    }
    if (currentGl === 'pre-con') {
        return 'confirmation';
    }
    return '';
}

function getNextVNLevel(currentVn) {
    if (currentVn === 'vn-01') {
        return 'vn-02';
    }
    if (currentVn === 'vn-02') {
        return 'vn-03';
    }
    if (currentVn === 'vn-03') {
        return 'vn-04';
    }
    if (currentVn === 'vn-04') {
        return 'vn-05';
    }
    if (currentVn === 'vn-05') {
        return 'vn-06';
    }
    if (currentVn === 'vn-06') {
        return 'vn-07';
    }
    if (currentVn === 'vn-07') {
        return 'vn-08';
    }
    return '';
}

function getCurrentVNLevel(currentVn) {
    if (currentVn === 'vn-01') {
        return 'vn-01';
    }
    if (currentVn === 'vn-02') {
        return 'vn-02';
    }
    if (currentVn === 'vn-03') {
        return 'vn-03';
    }
    if (currentVn === 'vn-04') {
        return 'vn-04';
    }
    if (currentVn === 'vn-05') {
        return 'vn-05';
    }
    if (currentVn === 'vn-06') {
        return 'vn-06';
    }
    if (currentVn === 'vn-07') {
        return 'vn-07';
    }
    if (currentVn === 'vn-08') {
        return 'vn-08';
    }
    return '';
}

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');
    var Household = mongoose.model('Household');
    var HouseholdStudent = mongoose.model('HouseholdStudent');

    Registration.find({'year': 2017, 'status': {$in: ['APPROVED', 'RECEIVED']}}).exec()
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
            var registrations = result[0];
            var users = result[1];
            var progress = result[2];
            var households = result[3];
            var householdStudents = result[4];

            var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2018-prep3.txt");
            stream.once('open', function (fd) {

                stream.write('FatherName|FatherPhone|MotherName|MotherPhone|Address|City|ZipCode|Email1|Email2|S1_First|S1_Last|S1_Middle|S1_Gender|S1_BirthDate|S1_Grade|S1_BCert|S1_VN|S1_VNN|S1_GL|S1_GLN'
                            +'|S2_First|S2_Last|S2_Middle|S2_Gender|S2_BirthDate|S2_Grade|S2_BCert|S2_VN|S2_VNN|S2_GL|S2_GLN|S3_First|S3_Last|S3_Middle|S3_Gender|S3_BirthDate|S3_Grade|S3_BCert|S3_VN|S3_VNN|S3_GL|S3_GLN'
                            +'|S4_First|S4_Last|S4_Middle|S4_Gender|S4_BirthDate|S4_Grade|S4_BCert|S4_VN|S4_VNN|S4_GL|S4_GLN\n');

                for (var i = 0, len = households.length; i < len; i++) {
                    var fatherName = households[i].fatherFirstName + ' ' + households[i].fatherLastName;
                    var motherName = households[i].motherFirstName + ' ' + households[i].motherLastName;
                    var students = findStudentsFromHouseHold(householdStudents, users, registrations, progress, households[i]._id.toHexString());
                    if (students.length === 1 && students[0].glClass === 'confirmation') {
                        // Do nothing
                    } else if (students.length > 0) {
                        var fatherPhone = (students[0].phones.length > 0) ? findPhone(students[0].phones, 'DAD'):'';
                        var motherPhone = (students[0].phones.length > 0) ? findPhone(students[0].phones, 'MOM'):'';
                        var email1 = (students[0].emails.length > 0) ? students[0].emails[0].address:'';
                        var email2 = (students[0].emails.length > 1) ? students[0].emails[1].address:'';
                        stream.write(
                            fatherName+'|'+fatherPhone+'|'+motherName+'|'+motherPhone+'|'+
                            households[i].address+'|'+households[i].city+'|'+households[i].zipCode+'|'+email1+'|'+email2+'|');

                        if (students.length > 0) {
                            if (students[0].glClass !== 'confirmation') {
                                let currGl = getCurrentGLLevel(students[0].glClass);
                                let currVn = getCurrentVNLevel(students[0].vnClass);
                                let nextGl = getNextGLLevel(students[0].glClass);
                                let nextVn = getNextVNLevel(students[0].vnClass);
                                let hasBapCert = (students[0].hasBaptismCert === true) ? 'T':'F';
                                stream.write(students[0].first + '|' + students[0].last + '|' + students[0].middle + '|' + students[0].gender[0] + '|' +
                                    dateFormat(students[0].birthDate, 'mm/dd/yyyy') + '|' + students[0].grade + '|' + hasBapCert + '|' +
                                    currVn + '|' + nextVn + '|' + currGl + '|' + nextGl);
                            }
                        }
                        if (students.length > 1) {
                            if (students[1].glClass !== 'confirmation') {
                                let currGl = getCurrentGLLevel(students[1].glClass);
                                let currVn = getCurrentVNLevel(students[1].vnClass);
                                let nextGl = getNextGLLevel(students[1].glClass);
                                let nextVn = getNextVNLevel(students[1].vnClass);
                                let hasBapCert = (students[1].hasBaptismCert === true) ? 'T':'F';
                                stream.write('|' + students[1].first + '|' + students[1].last + '|' + students[1].middle + '|' + students[1].gender[0] + '|' +
                                    dateFormat(students[1].birthDate, 'mm/dd/yyyy') + '|' + students[1].grade + '|' + hasBapCert + '|' +
                                    currVn + '|' + nextVn + '|' + currGl + '|' + nextGl);
                            }
                        }
                        if (students.length > 2) {
                            if (students[2].glClass !== 'confirmation') {
                                let currGl = getCurrentGLLevel(students[2].glClass);
                                let currVn = getCurrentVNLevel(students[2].vnClass);
                                let nextGl = getNextGLLevel(students[2].glClass);
                                let nextVn = getNextVNLevel(students[2].vnClass);
                                let hasBapCert = (students[2].hasBaptismCert === true) ? 'T':'F';
                                stream.write('|' + students[2].first + '|' + students[2].last + '|' + students[2].middle + '|' + students[2].gender[0] + '|' +
                                    dateFormat(students[2].birthDate, 'mm/dd/yyyy') + '|' + students[2].grade + '|' + hasBapCert + '|' +
                                    currVn + '|' + nextVn + '|' + currGl + '|' + nextGl);
                            }
                        }
                        if (students.length > 3) {
                            if (students[3].glClass !== 'confirmation') {
                                let currGl = getCurrentGLLevel(students[3].glClass);
                                let currVn = getCurrentVNLevel(students[3].vnClass);
                                let nextGl = getNextGLLevel(students[3].glClass);
                                let nextVn = getNextVNLevel(students[3].vnClass);
                                let hasBapCert = (students[3].hasBaptismCert === true) ? 'T':'F';
                                stream.write('|' + students[3].first + '|' + students[3].last + '|' + students[3].middle + '|' + students[3].gender[0] + '|' +
                                    dateFormat(students[3].birthDate, 'mm/dd/yyyy') + '|' + students[3].grade + '|' + hasBapCert + '|' +
                                    currVn + '|' + nextVn + '|' + currGl + '|' + nextGl);
                            }
                        }
                        stream.write('\n');
                    }
                }
                stream.end();
            });

        });
});
