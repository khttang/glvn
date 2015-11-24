'use strict';

angular.module('users').controller('AdministrationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', '$modal', '$log',
    function ($scope, $state, $http, $location, $window, Authentication, $modal, $log) {
        $scope.authentication = Authentication;

        $scope.animationsEnabled = true;

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        this.findStudent = function(studentId, email, address) {

            console.warn("Test findStudent()");
        };

        this.createNewStudent = function() {
            console.warn("Test createNewStudent()");
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

        this.modalCreateNewStudent = function (size) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/signup.client.view.html',
                controller: 'home.modal as vm',
                size: size,
                resolve: {

                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        /*
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
        */

    }
]);

angular.module('users').controller('home.modal', ['$scope', '$modalInstance', function($scope, $modalInstance) {
    $scope.registration = true;
    $scope.modalTitle = 'Register New Student    School Year: '+ new Date().getFullYear();

    function selectCustomer() {
        $modalInstance.close("Selected Customer");
    }

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);
