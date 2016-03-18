'use strict';

angular.module('users').controller('AdministrationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', '$uibModal', 'userService', '$log',
    function ($scope, $state, $http, $location, $window, Authentication, $uibModal, userService, $log) {
        $scope.authentication = Authentication;

        $scope.animationsEnabled = true;

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        $scope.user = userService.getUser();

        /* $$$$KT
        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }
        */

        this.findStudent = function(criteria) {
            $http.get('/api/users?criteria='+criteria).success(function (response) {
                $scope.students = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        this.findStudentForRegistration = function(studentId, criteria) {
            if (studentId !== null && criteria === null) {
                $http.get('/api/users?student_id='+studentId).success(function (response) {
                    $scope.students = response;
                }).error(function (response) {
                    $scope.error = response.message;
                });
            } else if (studentId === null && criteria !== null) {
                // findStudent(criteria);
                $http.get('/api/users?criteria='+criteria).success(function (response) {
                    $scope.students = response;
                }).error(function (response) {
                    $scope.error = response.message;
                });
            } else {
                alert('Either studentId or parent email/phone/address can be specified, not both.');
            }
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

        this.modalCreateNewStudent = function (size, registration) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/signup.client.view.html',
                controller: 'newstudent.modal as vm',
                size: size
            });
            modalInstance.registration = registration;
        };

        this.modalUpdateStudent = function (size, editUser) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/challenge.client.view.html',
                controller: 'updstudent.modal as vm',
                size: size
            });

            modalInstance.result.then(function (modalData) {
                var tmpDate = new Date(editUser.birthDate);

                if (modalData.fatherName.toLowerCase() === editUser.fatherFirstName.toLowerCase() &&
                    modalData.saintName.toLowerCase() === editUser.saintName.toLowerCase() &&
                    modalData.birthDate.getTime() === tmpDate.getTime()) {

                    //modalAdminUpdateStudent('lg', editUser);

                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/signup.client.view.html',
                        controller: 'newstudent.modal as vm',
                        size: 'lg'
                    });
                    modalInstance.registration = 'update';
                    userService.putUser(editUser);
                }
            });
        };

        this.modalAdminUpdateStudent = function (size, editUser) {
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/signup.client.view.html',
                controller: 'newstudent.modal as vm',
                size: size
            });
            modalInstance.registration = 'update';
            userService.putUser(editUser);
        }

        this.modalAdminRegisterStudent = function (size, user) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/register.client.view.html',
                controller: 'updstudent.modal as vm',
                size: size
            });
        }
    }
]);

angular.module('users').controller('newstudent.modal', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
    $scope.registration = $uibModalInstance.registration;
    var action = 'Register ';
    if ($scope.registration === 'create') {
        action = 'Create ';
    } else if ($scope.registration === 'update') {
        action = 'Update ';
    }
    $scope.modalTitle = action + 'Student    School Year: '+ new Date().getFullYear();

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);

angular.module('users').controller('updstudent.modal', ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {

    $scope.ok = function () {
        $uibModalInstance.close($scope.modalData);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);
