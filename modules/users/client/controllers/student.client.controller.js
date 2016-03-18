'use strict';

angular.module('users').controller('StudentController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
    function ($scope, $state, $http, $location, $window, Authentication) {

        $scope.animationsEnabled = true;

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        this.findStudent = function(criteria) {
            console.warn('Test findStudent()');
        };

        this.createNewStudent = function() {
            console.warn('Test createNewStudent()');
            $http.post('/api/users', $scope.user).success(function (response) {

            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]);
