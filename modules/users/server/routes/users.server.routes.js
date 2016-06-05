'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/register').post(users.register);
  app.route('/api/users').post(users.create);
  app.route('/api/users/admin').post(users.createAdmin);
  app.route('/api/users').get(users.find);
  app.route('/api/users/registrations').get(users.getRegistrations);
  app.route('/api/users/progress').get(users.getProgress);
  app.route('/api/users/me').get(users.me);
  app.route('/api/users/photo').get(users.findPhoto);
  app.route('/api/users').put(users.update);
  app.route('/api/users/registration').put(users.addRegistration);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  // Nodemailer service
  app.route('/api/emails').post(users.postGmail);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
