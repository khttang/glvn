var mysql = require('mysql'),
    fs = require('fs');

var pool  = mysql.createPool({
    connectionLimit: 25,
    //host: 'localhost',
    host: '104.236.175.61',
    //user: 'superuser',
    //password: 'glSuPerVN',
    //password: 'gl@ppApr2016VN',
    //user: 'root',
    user: 'glvnapp',
    password: 'glAppApr2016VN',
    //password: 'glR0otVN',
    //password: 'P@ssw0rd',
    database: 'glvn',
    debug: false
    /*
    ssl  : {
        ca : fs.readFileSync(__dirname + '/../sslcerts/mysql-ca-cert.pem'),
        key: fs.readFileSync(__dirname + '/../sslcerts/mysql-client-key.pem'),
        cert: fs.readFileSync(__dirname + '/../sslcerts/mysql-client-cert.pem')
    }
    */
});

exports.pool = pool;