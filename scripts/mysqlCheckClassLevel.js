var chalk = require('chalk'),
    mysql = require('mysql'),
    fs = require('fs');

var pool      =    mysql.createPool({
    connectionLimit : 20,
    host     : 'localhost',
    user     : 'root',
    password : 'P@ssw0rd',
    database : 'glvn',
    debug    :  false
});

var lookup_student = 'SELECT Student.LastName,Student.FirstName,Student.BirthDate,Student.StudentId,Registration.Year,Registration.GlClass,Registration.VnClass,Registration.GradeLevel from Registration '+
                     'LEFT JOIN Student ON Student.StudentId=Registration.StudentId '+
                     'WHERE Registration.Year=2016 order by Registration.GlClass,Student.LastName, Student.FirstName';

pool.getConnection(function (err, connection) {
    if (!err) {
        connection.query(lookup_student, function (err, students) {
            if (students !== undefined) {
                for (var i = 0, len = students.length; i < len; i++) {
                    var s = students[i];
                    if (s.GlClass !== null && s.GlClass !== '') {
                    //if (s.GlClass === 'gl-1') {
                        var level = s.GlClass;
                        if (level === 'pre-con') {
                            level = 9;
                        } else if (level === 'confirmation') {
                            level = 10;
                        }
                        //var expectedLevel = getAge(s.BirthDate);
                        //console.log(s.LastName+' '+s.FirstName+' bdate:'+s.BirthDate.toISOString().substring(0, 10)+' age:'+expectedLevel+' level:'+level);

                        var expectedLevel = getAge(s.BirthDate) - 5;
                        if (level >= s.GradeLevel+1) {
                            console.log(s.LastName+' '+s.FirstName+' bdate:'+s.BirthDate.toISOString().substring(0, 10)+' grade:'+s.GradeLevel+' exp-gl:'+expectedLevel);
                        }

                        /*
                        if (level < expectedLevel) {
                            console.log(s.LastName+' '+s.FirstName+' bdate:'+s.BirthDate.toISOString().substring(0, 10)+' grade:'+s.GradeLevel+' exp-gl:'+expectedLevel+' gl:'+s.GlClass+' - TOO OLD.');
                        }
                        if (level > expectedLevel+1) {
                            console.log(s.LastName+' '+s.FirstName+' bdate:'+s.BirthDate.toISOString().substring(0, 10)+' grade:'+s.GradeLevel+' exp-gl:'+expectedLevel+' gl:'+s.GlClass+' - TOO YOUNG.');
                        }
                        */
                    }
                }
            }
        });
    }
});


function getAge(birthDate)
{
    var today = new Date(2016,8,1);  // month index from 0
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
    {
        age--;
    }
    return age;
}

