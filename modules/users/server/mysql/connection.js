'use strict';

var mysql = require('mysql');

function Connection() {
    this.pool = null;

    this.init = function() {
        this.pool = mysql.createPool({
            connectionLimit : 20,
            host     : 'localhost',
            user     : 'root',
            password : 'P@ssw0rd',
            database : 'glvn',
            debug    :  false
        });
    };

    this.acquire = function(callback) {
        this.pool.getConnection(function(err, connection) {
            callback(err, connection);
        });
    };
}

module.exports = new Connection();