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
    var endDate = new Date('2016-05-20');

    Registration.find({
        'received' : {
            $lt: endDate,
            $gte: beginDate
        },
        'status': 'APPROVED'
    }, function(err, docs) {
        if (!err) {

            var preConAndCon = 0;
            var feeCollected = 0;
            var exempts = new Number(0);
            var mapClasses = new HashMap();

            for (var i = 0, len = docs.length; i < len; i++) {
                var reg = docs[i];
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
            }

            console.log('Summary Report');
            mapClasses.forEach(function(value, key) {
                console.log(key + " : " + value);
            });

            var activityFees = 20 * preConAndCon;
            console.log('Registrations received: '+ docs.length);
            console.log('Activity fees: $' + activityFees);
            console.log('Total fees collected: $' + feeCollected);
            console.log('Teacher exempts: ' + exempts);
        }
    });



/*
    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var user = new User(data.user);
        user.save(function (err) {
            if (err) {
                throw new Error("Can't save user: "+ err);
            }
        });
    }

    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var student = new Student(data.student);
        student.save(function (err) {
            if (err) {
                throw new Error("Can't save student: " + err);
            }
        });
    }

    for (var i = 0, len = importJson.length; i < len; i++) {
        var data = importJson[i];
        var registration = new Registration(data.registration);
        registration.save(function (err) {
            if (err) {
                throw new Error("Can't save registration: " + err);
            }
        });
    }
    */
});
