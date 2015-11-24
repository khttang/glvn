'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', 'Authentication', 'Users',
    function ($scope, $stateParams, Authentication, Users) {

    }
]);

angular.module('users').controller('UsersCreateController', ['$scope', '$http', 'Users', '$modal', '$log',
    function ($scope, $http, Users, $modal, $log) {

        $scope.user = {
            emails: [],
            phones: []
        };

        this.create = function(userType) {

            $http.post('/api/users/registration', $scope.user).success(function (response) {

            }).error(function (response) {
                $scope.error = response.message;
            });

            /*
            var user = new Users({
                // user properties
                type: userType,
                saintName: $scope.user.saintName,
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                middleName: $scope.user.middleName,
                gender: $scope.user.gender,
                birthDate: $scope.user.birthDate,
                address: $scope.user.address,
                city: $scope.user.city,
                zipCode: $scope.user.zipCode,
                emails: $scope.user.emails,
                phones: $scope.user.phones
            });

            user.$save(function(response) {

                // clear form fields $scope.
                $scope.user = {
                    emails: [],
                    phones: []
                };
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
            */
        };
        
        this.addNewEmail = function(size) {
            $scope.modalData = {
                email: ''
            };

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
                controller: 'newmodal as vm',
                size: size
            });

            modalInstance.result.then(function (modalData) {
                $scope.user.emails.push(modalData.email);
            });
        };

        this.removeEmail = function (index) {
            if (index !== null) {
                $scope.user.emails.splice(index, 1);
            }
        };

        this.addNewPhone = function(size) {
            $scope.modalData = {
                phone: ''
            };

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
                controller: 'newmodal as vm',
                size: size
            });

            modalInstance.result.then(function (modalData) {
                $scope.user.phones.push(modalData.phone);
            });
        };

        this.removePhone = function (index) {
            if (index !== null) {
                $scope.user.phones.splice(index, 1);
            }
        };

        $scope.selectedEmail = null;  // initialize our variable to null
        $scope.setClickedEmail = function(index) {  //function that sets the value of selectedRow to current index
            $scope.selectedEmail = index;
        };

        $scope.selectedPhone = null;  // initialize our variable to null
        $scope.setClickedPhone = function(index) {  //function that sets the value of selectedRow to current index
            $scope.selectedPhone = index;
        };
    }
]);

angular.module('users').controller('newmodal', ['$scope', '$modalInstance', function($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close($scope.modalData);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);
