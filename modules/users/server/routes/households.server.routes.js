'use strict';

module.exports = function (app) {
    // User Routes
    var users = require('../controllers/users.server.controller');
    var households = require('../controllers/households.server.controller');

    // Setting up the users profile api
    app.route('/api/households/register').post(households.register);
    app.route('/api/households').get(households.getHouseHolds);

};
