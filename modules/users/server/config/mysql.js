'use strict';


var config = require('../config'),
    chalk = require('chalk'),
    path = require('path'),
    mysql = require('mysql'),
    async = require('async');

var state = {
    pool: null,
    mode: null,
};

exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
        connectionLimit : 20,
        host     : 'localhost',
        user     : 'root',
        password : 'P@ssw0rd',
        database : 'glvn',
        debug    :  false
    });
    state.pool.query('USE glvn');

    state.mode = mode;
    done();
};

exports.get = function() {
    return state.pool;
};

exports.fixtures = function(data) {
    var pool = state.pool;
    if (!pool) return done(new Error('Missing database connection.'));

    var names = Object.keys(data.tables);
    async.each(names, function(name, cb) {
        async.each(data.tables[name], function(row, cb) {
            var keys = Object.keys(row);
            var values = keys.map(function(key) { return "'" + row[key] + "'" });

            pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb);
        }, cb);
    }, done);
};

exports.drop = function(tables, done) {
    var pool = state.pool;
    if (!pool) return done(new Error('Missing database connection.'));

    async.each(tables, function(name, cb) {
        pool.query('DELETE * FROM ' + name, cb)
    }, done);
};