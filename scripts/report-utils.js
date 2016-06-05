var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    fs = require('fs'),
    HashMap = require('hashmap');

mg.loadModels();

mg.connect(function (db) {

    var User = mongoose.model('User');
    var Student = mongoose.model('Student');
    var Registration = mongoose.model('Registration');

    var beginDate = new Date('2016-05-13');
    var endDate = new Date('2016-05-23');
    var fixupDate = new Date('2016-05-25');

    var unregistered = new Array();
    var registered2016 = new Array();

    Registration.find({
        'year': '2015'
    }, function(err, docs) {
        if (!err) {
            var previousYearRegs = docs;
            Registration.find({
                'year': '2016',
                'status': {$in: ['APPROVED', 'RECEIVED']}
            }, function (err, docs) {
                if (!err) {

                    User.find({'userType': 'STUDENT'}, function (err, users) {
                        if (!err) {
                            for (var i = 0, len = users.length; i < len; i++) {
                                var u = users[i];
                                var registered = null;
                                for (var j = 0, len2 = docs.length; j < len2; j++) {
                                    var reg2016 = docs[j];
                                    if (u.username === reg2016.studentId) {
                                        registered = reg2016;
                                        break;
                                    }
                                }

                                if (registered === null) {
                                    for (var jj = 0, len4 = previousYearRegs.length; jj < len4; jj++) {
                                        if (u.username === previousYearRegs[jj].studentId) {
                                            var recUser = u;
                                            recUser.reg2015 = previousYearRegs[jj];
                                        }
                                    }
                                    unregistered.push(recUser);
                                } else {
                                    u.reg2016 = registered;
                                    registered2016.push(u);
                                }
                            }

                            var notcompleted = 0;
                            var stream = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/unregistered.csv");
                            stream.once('open', function (fd) {

                                for (var ii = 0, len3 = unregistered.length; ii < len3; ii++) {
                                    stream.write(unregistered[ii].firstName + ',' + unregistered[ii].lastName + ',' + unregistered[ii].fatherFirstName + ' ' + unregistered[ii].fatherLastName + ',' +
                                        unregistered[ii].motherFirstName + ' ' + unregistered[ii].motherLastName + ',' +
                                        unregistered[ii].address + ',' + unregistered[ii].phones[0].number + ',' +
                                        unregistered[ii].emails[0].address + ',' + unregistered[ii].reg2015.year + ',' + unregistered[ii].reg2015.schoolGrade + ',' + unregistered[ii].reg2015.vnClass + ',' +
                                        unregistered[ii].reg2015.glClass + '\n');

                                    if (unregistered[ii].reg2015.glClass !== 'Confirmation') {
                                        ++notcompleted;
                                    }
                                }

                                stream.end();
                            });

                            var stream2 = fs.createWriteStream("/Users/ktang/Personal/Khiem/GLVN/WebProject/export/registered-2016.csv");
                            stream2.once('open', function (fd2) {

                                for (var k = 0, len10 = registered2016.length; k < len10; k++) {
                                    stream2.write(
                                        registered2016[k].firstName + ',' + registered2016[k].lastName + ',' + registered2016[k].fatherFirstName + ' ' + registered2016[k].fatherLastName + ',' +
                                        registered2016[k].motherFirstName + ' ' + registered2016[k].motherLastName + ',' +
                                        registered2016[k].address + ',' + registered2016[k].phones[0].number + ',' +
                                        registered2016[k].emails[0].address + ',' + registered2016[k].reg2016.year + ',' + registered2016[k].reg2016.schoolGrade + ',' + registered2016[k].reg2016.vnClass + ',' +
                                        registered2016[k].reg2016.glClass + '\n');
                                }

                                stream2.end();
                            });


                            var receivedCnt = 0;
                            var approvedCnt = 0;
                            var preConAndCon = 0;
                            var feeCollected = 0;
                            var exempts = new Number(0);
                            var mapClasses = new HashMap();

                            for (var i = 0, len = docs.length; i < len; i++) {
                                var reg = docs[i];

                                if (reg.status === 'APPROVED') {
                                    ++approvedCnt;
                                    feeCollected += new Number(reg.regFee);
                                    if (reg.regTeacherExempt) {
                                        exempts += 1;
                                    }

                                    var counter;
                                    if (reg.glClass !== null) {
                                        if (reg.glClass === 'pre-con' || reg.glClass === 'confirmation') {
                                            preConAndCon += 1;
                                        }

                                        counter = mapClasses.get(reg.glClass);
                                        if (counter === undefined) {
                                            counter = new Number(0);
                                        }
                                        counter += 1;
                                        mapClasses.set(reg.glClass, counter);
                                    }

                                    if (reg.vnClass !== null) {
                                        counter = mapClasses.get(reg.vnClass);
                                        if (counter === undefined) {
                                            counter = new Number(0);
                                        }
                                        counter += 1;
                                        mapClasses.set(reg.vnClass, counter);
                                    }
                                } else if (reg.status === 'RECEIVED') {
                                    ++receivedCnt;
                                }
                            }

                            console.log('Summary Report');
                            mapClasses.forEach(function (value, key) {
                                console.log(key + " : " + value);
                            });

                            var activityFees = 20 * preConAndCon;
                            console.log('Registrations received: ' + docs.length + ', approved: ' + approvedCnt + ', collected fees: $' + feeCollected);
                            console.log('Activity fees: $' + activityFees);
                            feeCollected += activityFees;
                            console.log('Total fees collected: $' + feeCollected);
                            console.log('Teacher exempts: ' + exempts);
                            console.log('Students not yet registered: ' + unregistered.length + ', should register: ' + notcompleted);
                        }
                    });
                }
            });

            Registration.find({
                $and: [
                    {
                        'reviewed': {$gte: fixupDate}
                    },
                    {'year': '2016'},
                    {
                        'status': {$in: ['APPROVED', 'RECEIVED']}
                    }
                ]
            }, function (err, docs) {
                if (!err) {
                    console.log('Number of fixups: '+ docs.length);
                }
            });
        }
    });
});
