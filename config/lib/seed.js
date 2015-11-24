'use strict';

var mongoose = require('mongoose'),
  chalk = require('chalk'),
  crypto = require('crypto'),
  User = mongoose.model('User');

console.log(chalk.bold.red('Warning:  Database seeding is turned on'));

//If production only seed admin if it does not exist
if (process.env.NODE_ENV === 'production') {
  //Add Local Admin
  User.find({username: 'admin'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        status: 'PROVISIONED',
        userType: 'TEACHER',
        canLogin: true,
        username: 'admin',
        password: password,
        provider: 'local',
        email: 'admin@localhost.com',
        saintName: 'Saint Name',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        gender: 'Male',
        birthDate: '01/23/1999',
        address: 'address line1',
        city: 'my city',
        zipCode: '92129',
        roles: ['ADMIN']
      });

      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local admin');
        } else {
          console.log(chalk.bold.red('Local admin added with password set to ' + password));
        }
      });
    } else {
      console.log('Admin user exists');
    }
  });
} else {
  //Add Local User
  User.find({username: 'user'}, function (err, users) {
    if (users.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);
      var user = new User({
        status: 'PROVISIONED',
        userType: 'STUDENT',
        canLogin: true,
        username: 'user',
        password: password,
        provider: 'local',
        email: 'user@localhost.com',
        saintName: 'Saint Name',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        gender: 'Male',
        birthDate: '01/23/1999',
        address: 'address line1',
        city: 'my city',
        zipCode: '92129',
        roles: ['STUDENT']
      });

      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local user '+err);
        } else {
          console.log(chalk.bold.red('Local user added with password set to ' + password));
        }
      });
    } else {
      console.log('user exists');
    }
  });


  //Add Local Admin
  User.find({username: 'admin'}, function (err, admins) {
    if (admins.length === 0) {
      var password = crypto.randomBytes(64).toString('hex').slice(1, 20);

      var user = new User({
        status: 'PROVISIONED',
        userType: 'TEACHER',
        canLogin: true,
        username: 'admin',
        password: password,
        provider: 'local',
        email: 'admin@localhost.com',
        saintName: 'Saint Name',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        gender: 'Male',
        birthDate: '01/23/1999',
        address: 'address line1',
        city: 'my city',
        zipCode: '92129',
        roles: ['STUDENT', 'ADMIN']
      });

      // Then save the user
      user.save(function (err) {
        if (err) {
          console.log('Failed to add local admin');
        } else {
          console.log(chalk.bold.red('Local admin added with password set to ' + password));
        }
      });
    } else {
      console.log('admin exists');
    }
  });
}
