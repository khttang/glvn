'use strict';

angular.module('users').controller('AdministrationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', '$uibModal', 'userService', '$log',
    function ($scope, $state, $http, $location, $window, Authentication, $uibModal, userService, $log) {
        $scope.authentication = Authentication;

        $scope.animationsEnabled = true;

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        $scope.user = userService.getUser();

        this.isRegistered = function (studentId) {
            if ($scope.registrations !== undefined) {
                var regYear = new Date().getFullYear();
                for (var i = 0, len=$scope.registrations.length; i < len; i++) {
                    if (studentId === $scope.registrations[i].studentId) {
                        if ($scope.registrations[i].year === regYear) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        this.findStudent = function(criteria) {
            $scope.success = $scope.error = null;
            $http.get('/api/users?criteria='+criteria).success(function (response) {
                $scope.students = response;
                }).error(function (response) {
                $scope.error = response.message;
            });
        };

        this.findStudentForRegistration = function(studentId, criteria) {
            $scope.success = $scope.error = null;
            if (studentId !== undefined && criteria === undefined) {
                $http.get('/api/users?student_id='+studentId).success(function (response) {
                    $scope.students = response;

                    var studentids = [];
                    for(var i=0, len=response.length; i < len; i++){
                        studentids.push(response[i].username);
                    }
                    $http.get('/api/users/registrations?student_ids='+JSON.stringify(studentids)).success(function (response2) {
                        $scope.registrations = response2;
                        var currentyr = new Date().getFullYear();

                        for(var i=0, len=response.length; i < len; i++) {
                            response[i].registrations = [];
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
            } else if (studentId === undefined && criteria !== undefined) {
                $http.get('/api/users?criteria='+criteria).success(function (response) {
                    $scope.students = response;

                    var studentids = [];
                    for(var i=0, len=response.length; i < len; i++){
                        studentids.push(response[i].username);
                    }
                    $http.get('/api/users/registrations?student_ids='+JSON.stringify(studentids)).success(function (response2) {
                        $scope.registrations = response2;
                        var currentyr = new Date().getFullYear();

                        for(var i=0, len=response.length; i < len; i++) {
                            response[i].registrations = [];
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
                $scope.error = 'Either studentId or parent email/phone/address can be specified, not both.';
            }
        };

        this.findStudentsForApproval = function() {
            var currentyr = new Date().getFullYear();
            var statuses = ['RECEIVED', 'PROCESSING', 'INCOMPLETE'];
            $http.get('/api/users/registrations?status='+JSON.stringify(statuses)).success(function (response) {

                var studentids = [];
                for(var i=0, len=response.length; i < len; i++){
                    studentids.push(response[i].studentId);
                }

                $http.get('/api/users?student_ids='+JSON.stringify(studentids)).success(function (response2) {
                    $scope.students = response2;

                    for(var i=0, len=response2.length; i < len; i++) {
                        response2[i].registrations = [];
                        for (var j = 0, len2=response.length; j < len2; j++) {
                            if (response2[i].username === response[j].studentId) {
                                if (response[j].year === currentyr) {
                                    response2[i].current_reg = response[j];
                                } else {
                                    response2[i].registrations.push(response[j]);
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
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

        this.modalCreateNewStudent = function (size, registration) {
            userService.clearUser();
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/signup.client.view.html',
                controller: 'newstudent.modal as vm',
                size: size
            });
            modalInstance.registration = registration;
            $scope.success = $scope.error = null;

            modalInstance.result.then(function () {
                var uri = (registration === 'register') ? '/api/users/register' : '/api/users';
                var _user = userService.getUser();
                _user.current_reg.receivedBy = $scope.authentication.user.username;
                $http.post(uri, _user).success(function() {
                    userService.clearUser();
                    $scope.success = registration + ' student completed successfully!';
                }).error(function(response) {
                    $scope.error = response;
                });
            });
        };

        this.modalUpdateStudent = function (size, editUser) {
            $scope.success = $scope.error = null;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/challenge.client.view.html',
                controller: 'updstudent.modal as vm',
                size: size
            });

            modalInstance.result.then(function (modalData) {
                var tmpDate = new Date(editUser.birthDate);

                if (modalData.motherName.toLowerCase() === editUser.motherFirstName.toLowerCase() &&
                    modalData.saintName.toLowerCase() === editUser.saintName.toLowerCase() &&
                    modalData.birthDate.getTime() === tmpDate.getTime()) {

                    var modalInstance2 = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/signup.client.view.html',
                        controller: 'newstudent.modal as vm',
                        size: 'lg'
                    });
                    modalInstance2.registration = 'update';
                    editUser.birthDate = new Date(editUser.birthDate);
                    userService.putUser(editUser);
                    $scope.success = $scope.error = null;

                    modalInstance2.result.then(function () {
                        $http.put('/api/users', userService.getUser()).success(function () {
                            userService.clearUser();
                            $scope.success = 'update student completed successfully!';
                        }).error(function (response) {
                            $scope.error = response;
                        });
                    });
                }
            });
        };

        this.modalAdminUpdateStudent = function (size, editUser) {
            $scope.success = $scope.error = null;
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/signup.client.view.html',
                controller: 'newstudent.modal as vm',
                size: size
            });
            modalInstance.registration = 'update';
            editUser.birthDate = new Date(editUser.birthDate);
            userService.putUser(editUser);
        };

        this.modalAdminRegisterStudent = function (size, user, reg_step) {
            $scope.success = $scope.error = null;
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
                        user.birthDate = new Date(user.birthDate);
                        return user;
                    }
                }
            });
            modalInstance.reg_step = reg_step;
            modalInstance.modalTitle = 'Register student ' + user.username + ' for school Year '+ new Date().getFullYear();
            modalInstance.result.then(function (modalData) {
                if (reg_step === 'intake') {
                    user.current_reg.receivedBy = $scope.authentication.user.username;
                    user.current_reg.studentId = user.username;
                } else if (reg_step === 'approve') {
                    user.current_reg.reviewedBy = $scope.authentication.user.username;
                    user.current_reg.status = 'APPROVED';
                }

                $http.put('/api/users/registration?student_id='+user.username, user.current_reg).success(function () {
                    $scope.success = 'Completed registration for student '+user.username+'. Congratulations!';
                }).error(function (response) {
                    $scope.error = response;
                });
            });
        };
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
    $scope.ok_text = ($uibModalInstance.reg_step === 'intake') ? 'Register':'Complete Registration';
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);