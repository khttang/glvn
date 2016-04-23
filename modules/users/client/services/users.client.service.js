'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('ADMIN', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('users').service('userService', function() {
  var user = {
    emails: [],
    phones: [],
    current_reg: {}
  };

  var clearUser = function() {
    user = {
      emails: [],
      phones: [],
      current_reg: {}
    };
  };

  var getUser = function() {
    return user;
  };

  var putUser = function(data) {
    user = data;
  };

  return {
    getUser: getUser,
    putUser: putUser,
    clearUser: clearUser
  };

});