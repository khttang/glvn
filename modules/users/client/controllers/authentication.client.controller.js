'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function ($scope, $state, $http, $location, $window, Authentication) {
    $scope.authentication = Authentication;

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };

    // Testing
    $scope.emails = [
      { address: 'khttang@gmail.com', selected: true},
      { address: 'khiem_tang@intuit.com', selected: false},
      { address: 'thompson@gmail.com', selected: false}
    ];

    $scope.selectedRow = null;  // initialize our variable to null
    $scope.setClickedRow = function(index) {  //function that sets the value of selectedRow to current index
      $scope.selectedRow = index;
    };

    $scope.phones = [
      { number: '(858)234-4567', selected: true},
      { number: '(619)628-2314', selected: false},
      { number: '(818)444-5432', selected: false},
      { number: '(408)782-4553', selected: false}
    ];

    $scope.selectedRow2 = null;  // initialize our variable to null
    $scope.setClickedRow2 = function(index) {  //function that sets the value of selectedRow to current index
      $scope.selectedRow2 = index;
    };
  }
]);
