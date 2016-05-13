'use strict';

angular.module('users').controller('AdministrationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'postEmailForm', '$uibModal', 'userService', '$log',
    function ($scope, $state, $http, $location, $window, Authentication, postEmailForm, $uibModal, userService, $log) {
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
                        $http.get('/api/users/progress?student_ids='+JSON.stringify(studentids)).success(function (response3) {
                            for(var i=0, len=response.length; i < len; i++) {
                                for (var j = 0, len2=response3.length; j < len2; j++) {
                                    if (response[i].username === response3[j].username) {
                                        response[i].hasBaptismCert = response3[j].hasBaptismCert;
                                    }
                                }
                            }
                        }).error(function (response) {
                            $scope.error = response.message;
                        });
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
                        $http.get('/api/users/progress?student_ids='+JSON.stringify(studentids)).success(function (response3) {
                            for(var i=0, len=response.length; i < len; i++) {
                                for (var j = 0, len2=response3.length; j < len2; j++) {
                                    if (response[i].username === response3[j].username) {
                                        response[i].hasBaptismCert = response3[j].hasBaptismCert;
                                    }
                                }
                            }
                        }).error(function (response) {
                            $scope.error = response.message;
                        });
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

            modalInstance.result.then(function (modalData) {
                $http.put('/api/users', userService.getUser()).success(function () {
                    userService.clearUser();
                    $scope.success = 'update student completed successfully!';
                }).error(function (response) {
                    $scope.error = response;
                });
            });
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
                    user.current_reg.baptismDate = user.baptismDate;
                    user.current_reg.baptismPlace = user.baptismParish;

                    $http.put('/api/users/registration?student_id='+user.username, user.current_reg).success(function () {
                        $scope.success = 'Completed registration for student '+user.username+'. Congratulations!';
                    }).error(function (response) {
                        $scope.error = response;
                    });

                } else if (reg_step === 'approve') {
                    user.current_reg.reviewedBy = $scope.authentication.user.username;
                    user.current_reg.status = 'APPROVED';

                    var modalInstance2 = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/registration_confirmation.client.view.html',
                        controller: 'regConfirm.modal as vm',
                        size: size,
                        resolve: {
                            user: function () {
                                return user;
                            }
                        }
                    });

                    modalInstance2.result.then(function (modalData) {

                        $http.put('/api/users/registration?student_id='+user.username, user.current_reg).success(function () {
                            $scope.success = 'Completed registration for student '+user.username+'. Congratulations!';
                        }).error(function (response) {
                            $scope.error = response;
                        });

                        /*
                        var data = ({
                            contactName: 'Khiem Tang',
                            contactEmail: 'khiem_tang@intuit.com',
                            contactMsg: 'This is a test'
                        });
                        postEmailForm.postEmail(data);
                        */
                    });
                }
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

angular.module('users').controller('regstudent.modal', ['user', 'registrations', '$scope', '$uibModalInstance', '$uibModal', function(user, registrations, $scope, $uibModalInstance, $uibModal) {

    var lateDate = new Date('2016-05-21');
    var curDate = new Date();
    $scope.basefee = (curDate < lateDate) ? 80:130;
    if (user.current_reg !== undefined) {
        if (user.current_reg.glClass === 'pre-con' || user.current_reg.glClass === 'confirmation') {
            $scope.extrafees = 20;
        } else {
            $scope.extrafees = 0;
        }
        user.current_reg.regFee = $scope.basefee + $scope.extrafees;
    }
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

    $scope.glClassChange = function() {
        if (user.current_reg.glClass === 'pre-con' || user.current_reg.glClass === 'confirmation') {
            $scope.extrafees = 20;
        } else {
            $scope.extrafees = 0;
        }
        user.current_reg.regFee = $scope.basefee + $scope.extrafees;
    }

    $scope.teacherExemptToggle = function() {
        if (user.current_reg.regTeacherExempt) {
            $scope.basefee = 0;
        } else {
            var curDate = new Date();
            $scope.basefee = (curDate < lateDate) ? 80:130;
        }
        user.current_reg.regFee = $scope.basefee + $scope.extrafees;
    }

    $scope.snapPhoto = function (photoType) {
        $scope.modalData = {};

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/snapPhoto.client.view.html',
            controller: 'newmodal as vm',
            size: 'lg',
            resolve: {
                modalData: function () {
                    return {
                        photoType: photoType,
                        photo: ''
                    };
                }
            }
        });
        modalInstance.modalTitle = 'Take ' + photoType + ' photo';
        modalInstance.result.then(function (modalData) {
            if (photoType === 'student') {
                $scope.user.picture = modalData.photo;
            } else if (photoType === 'certificate') {
                $scope.user.current_reg.baptismCert = modalData.photo;
            }
        });
    };
}]);

angular.module('users').controller('regConfirm.modal', ['user', 'Authentication', '$scope', '$uibModalInstance', function(user, Authentication, $scope, $uibModalInstance) {
    $scope.modalData = {};
    $scope.modalData.schoolPhone = '(858) 271-0207 ext 1260';
    $scope.modalData.schoolEmail = 'nguyenduykhang.glvn@gmail.com';
    $scope.modalData.schoolWebsite = 'https://nguyenduykhang.ddns.net:8443/';

    user.current_reg.regDate = new Date();
    user.current_reg.receivedBy = Authentication.user.username;
    $scope.user = user;
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.sendEmailToggle = function() {
        if ($scope.sendReceipt === false) {
            user.current_reg.regConfirmEmail = "";
        }
    }
}]);