var mongoose = require('mongoose'),
    chalk = require('chalk'),
    mg = require('../config/lib/mongoose'),
    mysql = require('mysql'),
    fs = require('fs');

mg.loadModels();

mg.connect(function (db) {
    var Student = mongoose.model('Student');
    var text = fs.readFileSync('/Users/ktang/Personal/Khiem/GLVN/BaptismCert/khiem.txt', 'utf8');

    var userList = text.split("\n");
    for (var i = 0, len = userList.length; i < len; i++) {
        Student.update({'username': userList[i]},
            {
                '$set': {
                    'hasBaptismCert': true
                }
            }).exec();
    }

});
