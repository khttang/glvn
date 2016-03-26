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

        this.isRegistered = function (registrations, studentId) {
            /* $$$KT
            var regYear = new Date().getFullYear();

            for (var i = 0, len=registrations.length; i < len; i++) {
                if (studentId === registrations[i].studentId) {
                    if (registrations[i].year === regYear) {
                        return true;
                    }
                }
            }
            */
            return false;
        }

        this.findStudent = function(criteria) {
            $http.get('/api/users?criteria='+criteria).success(function (response) {
                $scope.students = response;
                }).error(function (response) {
                $scope.error = response.message;
            });
        };

        this.findStudentForRegistration = function(studentId, criteria) {
            if (studentId !== undefined && criteria === undefined) {
                $http.get('/api/users?student_id='+studentId).success(function (response) {
                    $scope.students = response;
                }).error(function (response) {
                    $scope.error = response.message;
                });
            } else if (studentId === undefined && criteria !== undefined) {
                $http.get('/api/users?criteria='+criteria).success(function (response) {
                    $scope.students = response;

                    var studentids = new Array;
                    for(var i=0, len=response.length; i < len; i++){
                        studentids.push(response[i].username);
                    }
                    $http.get('/api/users/registrations?student_ids='+JSON.stringify(studentids)).success(function (response2) {
                        $scope.registrations = response2;
                        var currentyr = new Date().getFullYear();

                        for(var i=0, len=response.length; i < len; i++) {
                            response[i].registrations = new Array;
                            for (var j = 0, len2=response2.length; j < len2; j++) {
                                if (response[i].username === response2[j].studentId) {
                                    if (response2[j].year === currentyr) {
                                        response[i].current_reg = response2[j];
                                    } else {
                                        response[i].registrations.push(response2[j]);
                                    }
                                }
                            }
                        }

                        }).error(function (response) {
                        $scope.error = response.message;
                    });
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
                controller: 'regstudent.modal as vm',
                size: size,
                resolve: {
                    registrations: function () {
                        return user.registrations;
                    },
                    user: function () {
                        return user;
                    }
                }
            });

            modalInstance.modalTitle = 'Register student ' + user.username + ' for school Year '+ new Date().getFullYear();
            modalInstance.result.then(function (modalData) {
                $http.put('/api/users/registration?student_id='+user.username,
                    {
                        'studentId': modalData.username,
                        'glClass': modalData.glClass,
                        'vnClass': modalData.vnClass,
                        'receivedBy': 'tester'     // TODO: should provide user from auth'ed session
                    }
                ).success(function (response) {

                    // TODO: may need to say something here

                }).error(function (response) {
                        $scope.error = response.message;
                });

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

    $scope.modalTitle = $uibModalInstance.modalTitle;

    $scope.ok = function () {
        $uibModalInstance.close($scope.modalData);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);

angular.module('users').controller('regstudent.modal', ['user', 'registrations', '$scope', '$uibModalInstance', function(user, registrations, $scope, $uibModalInstance) {

    $scope.modalTitle = $uibModalInstance.modalTitle;
    $scope.user = user;
    $scope.registrations = registrations;
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);