'use strict';

angular.module('users').controller('AdministrationController', ['$scope', '$state', '$http', '$location', '$window', '$q', 'Authentication', 'postEmailForm', '$uibModal', 'userService', '$log',
    function ($scope, $state, $http, $location, $window, $q, Authentication, postEmailForm, $uibModal, userService, $log) {
        $scope.authentication = Authentication;

        $scope.animationsEnabled = true;

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;

        $scope.user = userService.getUser();

        this.isRegistered = function (studentId) {
            if ($scope.registrations !== undefined) {
                var regYear = new Date().getFullYear();
                for (var i = 0, len = $scope.registrations.length; i < len; i++) {
                    if (studentId === $scope.registrations[i].studentId) {
                        if ($scope.registrations[i].year === regYear) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        this.findStudent = function (criteria) {
            $scope.success = $scope.error = null;
            $http.get('/api/users?criteria=' + criteria).success(function (response) {
                $scope.students = response;
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
                $http.post(uri, _user).success(function () {
                    userService.clearUser();
                    $scope.success = registration + ' student completed successfully!';
                }).error(function (response) {
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

        var createUserPromise = function (url, user) {
            var deferred = $q.defer();
            if (user.username === undefined) {

                $http.post(url, user).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    deferred.reject(response);
                });
            }
            return deferred.promise;
        };

        this.modalAdminRegisterNewStudent = function (size) {
            userService.clearUser();
            var _user = userService.getUser();

            $scope.success = $scope.error = null;
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/register.client.view.html',
                controller: 'regstudent.modal as vm',
                size: size,
                resolve: {
                    registrations: function () {
                        return _user.registrations;
                    },
                    user: function () {
                        if (_user.birthDate !== undefined) {
                            _user.birthDate = new Date(_user.birthDate);
                        }
                        return _user;
                    }
                }
            });

            modalInstance.reg_step = 'approve';
            var tmpMsg = (_user.username !== undefined) ? 'Register student ' + _user.username : 'Register new student';
            modalInstance.modalTitle = tmpMsg + ' for school Year ' + new Date().getFullYear();
            modalInstance.result.then(function (modalData) {

                createUserPromise('/api/users', _user).then(function (data) {
                    data.photo = _user.photo;
                    data.baptismCert = _user.baptismCert;
                    data.current_reg = _user.current_reg;
                    userService.putUser(data);
                    _user = userService.getUser();

                    _user.current_reg.receivedBy = $scope.authentication.user.username;
                    _user.current_reg.reviewedBy = $scope.authentication.user.username;
                    _user.current_reg.status = 'APPROVED';

                    var modalInstance2 = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/registration_confirmation.client.view.html',
                        controller: 'regConfirm.modal as vm',
                        size: size,
                        resolve: {
                            user: function () {
                                return _user;
                            }
                        }
                    });

                    modalInstance2.result.then(function (modalData) {
                        $http.put('/api/users', _user).success(function () {
                            $scope.success = 'Completed registration for student ' + _user.username + '. Congratulations!';

                            /*
                            if (_user.current_reg.regConfirmEmail !== undefined) {
                                var context = {
                                    schoolPhone: '(858) 271-0207 ext 1260',
                                    schoolEmail: 'nguyenduykhang.glvn@gmail.com',
                                    schoolWebsite: 'https://nguyenduykhang.ddns.net:8443/',
                                    schoolYear: '2016-17',
                                    regDate: $filter('date')(_user.current_reg.regDate, 'MM/dd/yyyy'),
                                    username: _user.username,
                                    firstName: _user.firstName,
                                    lastName: _user.lastName,
                                    glClass: _user.current_reg.glClass,
                                    vnClass: _user.current_reg.vnClass,
                                    regFee: _user.current_reg.regFee,
                                    reviewedBy: _user.current_reg.reviewedBy,
                                    regReceivedFrom: _user.current_reg.regReceivedFrom,
                                    regReceipt: _user.current_reg.regReceipt,
                                    subject: 'Receipt of payment for registration of ' + _user.firstName + ' ' + _user.lastName,
                                    contactEmail: _user.current_reg.regConfirmEmail
                                    //contactEmail: 'khttang@gmail.com'
                                };
                                postEmailForm.postEmail(context);
                            }
                            */
                            $scope.load();
                        });
                    });
                });
            });
        };

        this.modalAdminRegisterNewHousehold = function (size) {
            var household = {
                emails: [],
                phones: [],
                emergency: {}
            };

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/users/client/views/register_household.client.view.html',
                controller: 'regHousehold.modal as vm',
                size: size,
                resolve: {
                    household: function () {
                        return household;
                    }
                }
            });

            modalInstance.result.then(function (modal_household) {
                modal_household.actor = Authentication.user.username;
                $http.post('/api/households/register', modal_household).success(function () {
                    $scope.success = 'A new household was added successfully!';
                    $scope.load();
                });
            });
        };

        this.modalAdminReport = function (size) {

            $http.get('/api/households/registration_report?reg_year='+ ApplicationConfiguration.regYear).success(function (response) {

                var registrationsByDay = new Map();
                for (var i = 0, len = response.length; i < len; i++) {
                    var audit = {
                        householdId: response[i].SubjectId,
                        details: JSON.parse(response[i].ActivityJson),
                        date: response[i].ActivityDate
                    };
                    var key = moment(audit.date).format('MMMM DD, YYYY'); //dateFormat(audit.date, 'mmmm dS, yyyy');
                    var regByDay = registrationsByDay.get(key);
                    if (regByDay === undefined) {
                        regByDay = [];
                    }
                    regByDay.push(audit);
                    registrationsByDay.set(key, regByDay);
                }

                let reportData = {
                    progressesByDay: [],
                    summary: {
                        householdCount: 0,
                        studentCount: 0,
                        totalAmount: 0,
                        checkAmount: 0,
                        cashAmount: 0,
                        exemptCount: 0,
                        lateCount: 0,
                        youthMinistry: 0
                    }
                }
                registrationsByDay.forEach(function(auditEvents, key) {
                    let households = 0;
                    let students = 0;
                    let totalAmount = 0;
                    let checkAmount = 0;
                    let cashAmount = 0;
                    let exemptCount = 0;
                    let lateCount = 0;
                    let youthMinistry = 0;

                    for (var i = 0, len = auditEvents.length; i < len; i++) {
                        let paidAmount = parseInt(auditEvents[i].details.payment.regFee);
                        households += 1;
                        totalAmount += paidAmount;
                        students += auditEvents[i].details.registrations.length;
                        if (auditEvents[i].details.payment.regTeacherExempt) {
                            exemptCount += 1;
                        }
                        if (auditEvents[i].details.payment.isLate) {
                            lateCount += 1;
                        }
                        if (!isNaN(auditEvents[i].details.checkNumber)) {
                            cashAmount += paidAmount;
                        } else {
                            checkAmount += paidAmount;
                        }

                        for (var j = 0, len2 = auditEvents[i].details.registrations.length; j < len2; j++) {
                            let gl = auditEvents[i].details.registrations[j].glClass;
                            if (gl === 'confirmation' || gl === 'pre-con') {
                                youthMinistry += 1;
                            }
                        }
                    }
                    reportData.progressesByDay.push({
                        reportDate: key,
                        householdCount: households,
                        studentCount: students,
                        totalAmount: totalAmount,
                        checkAmount: checkAmount,
                        cashAmount: cashAmount,
                        exemptCount: exemptCount,
                        lateCount: lateCount,
                        youthMinistry: youthMinistry
                    });
                    reportData.summary.householdCount += households;
                    reportData.summary.studentCount += students;
                    reportData.summary.totalAmount += totalAmount;
                    reportData.summary.checkAmount += checkAmount;
                    reportData.summary.cashAmount += cashAmount;
                    reportData.summary.exemptCount += exemptCount;
                    reportData.summary.lateCount += lateCount;
                    reportData.summary.youthMinistry += youthMinistry;
                });

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'modules/users/client/views/report_registration.client.view.html',
                    controller: 'showreport.modal as vm',
                    size: size,
                    resolve: {
                        reportData: function () {
                            return reportData;
                        }
                    }
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

angular.module('users').controller('payFee.modal', ['payment','registrations', '$scope', '$uibModalInstance', function(payment, registrations, $scope, $uibModalInstance) {

    $scope.modalTitle = $uibModalInstance.modalTitle;
    $scope.registrations = registrations;
    $scope.payment = payment;

    $scope.ok = function () {
        $uibModalInstance.close($scope.modalData);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function calcRegFee(glClass, isLate) {
        var regFee = (isLate) ? 150 : 100;
        if (glClass === 'pre-con' || glClass === 'confirmation') {
            regFee = (isLate) ? 200 : 150;
        }
        return regFee;
    }

    $scope.recalcTotal = function () {
        var feeAmount = 0;
        var paidAmount = 0;
        if ($scope.payment.regTeacherExempt !== true) {
            for (var i = 0, len = $scope.registrations.length; i < len; i++) {
                $scope.registrations[i].regFee = calcRegFee($scope.registrations[i].glClass, $scope.payment.isLate);
                feeAmount += $scope.registrations[i].regFee;
                if ($scope.registrations[i].regPaid !== null) {
                    paidAmount += parseInt($scope.registrations[i].regPaid);
                }
            }
        } else {
            for (var i = 0, len = $scope.registrations.length; i < len; i++) {
                $scope.registrations[i].regFee = 0;
                $scope.registrations[i].checkNumber = null;
                $scope.registrations[i].receipt = null;
                if ($scope.registrations[i].regPaid !== null) {
                    paidAmount += parseInt($scope.registrations[i].regPaid);
                }
            }
            $scope.payment.checkNumber = null;
            $scope.payment.receipt = null;
        }
        $scope.payment.regFee = String(feeAmount - paidAmount);
    };

    $scope.exemptToggle = function () {
        $scope.recalcTotal();
    };

    $scope.lateToggle = function () {
        $scope.recalcTotal();
    };

}]);

angular.module('users').controller('regstudent.modal', ['user', 'registrations', '$scope', '$http', '$uibModalInstance', '$uibModal', function(user, registrations, $scope, $http, $uibModalInstance, $uibModal) {

    var lateDate = new Date('2016-06-21');
    var curDate = new Date();
    $scope.basefee = (curDate < lateDate) ? 80:130;
    if (user.current_reg !== undefined) {
        if (user.current_reg.regTeacherExempt) {
            $scope.basefee = 0;
        }
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
    $scope.ok_text = ($uibModalInstance.reg_step === 'intake') ? 'Register':'Submit Registration';
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectedEmail = null;  // initialize our variable to null
    $scope.setClickedEmail = function(index) {  //function that sets the value of selectedRow to current index
        $scope.selectedEmail = index;
    };

    $scope.selectedPhone = null;  // initialize our variable to null
    $scope.setClickedPhone = function(index) {  //function that sets the value of selectedRow to current index
        $scope.selectedPhone = index;
    };

    $scope.glClassChange = function() {
        if (user.current_reg.glClass === 'pre-con' || user.current_reg.glClass === 'confirmation') {
            $scope.extrafees = 20;
        } else {
            $scope.extrafees = 0;
        }
        user.current_reg.regFee = $scope.basefee + $scope.extrafees;
    };

    $scope.teacherExemptToggle = function() {
        if (user.current_reg.regTeacherExempt) {
            $scope.basefee = 0;
        } else {
            var curDate = new Date();
            $scope.basefee = (curDate < lateDate) ? 80:130;
        }
        user.current_reg.regFee = $scope.basefee + $scope.extrafees;
    };

    $scope.addNewEmail = function(size) {
        $scope.modalData = {};
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
            controller: 'newmodal as vm',
            size: size,
            resolve: {
                modalData: function () {
                    return {
                        address: '',
                        owner: 'MOM'
                    };
                }
            }
        });
        modalInstance.modalTitle = 'Add new email';
        modalInstance.result.then(function (modalData) {
            $scope.user.emails.push(modalData);
        });
    };

    $scope.editEmail = function (index, size) {
        if (index !== null) {
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return $scope.user.emails[index];
                    }
                }
            });
            modalInstance.modalTitle = 'Update email';
            modalInstance.result.then(function (modalData) {
                if (modalData._id !== null) {
                    for (var i = 0; i < $scope.user.emails.length; i++) {
                        if ($scope.user.emails[i]._id === modalData._id) {
                            $scope.user.emails[i].owner = modalData.owner;
                            $scope.user.emails[i].address = modalData.address;
                        }
                    }
                } else {
                    $scope.user.emails.push(modalData);
                }
            });
        }
    };

    $scope.removeEmail = function (index) {
        if (index !== null) {
            $scope.user.emails.splice(index, 1);
        }
    };

    $scope.addNewPhone = function(size) {
        $scope.modalData = {};
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
            controller: 'newmodal as vm',
            size: size,
            resolve: {
                modalData: function () {
                    return {
                        number: '',
                        owner: 'MOM',
                        type: 'MOBILE'
                    };
                }
            }
        });
        modalInstance.modalTitle = 'Add new phone';
        modalInstance.result.then(function (modalData) {
            $scope.user.phones.push(modalData);
        });
    };

    $scope.removePhone = function (index) {
        if (index !== null) {
            $scope.user.phones.splice(index, 1);
        }
    };

    $scope.editPhone = function (index, size) {
        if (index !== null) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return $scope.user.phones[index];
                    }
                }
            });
            modalInstance.modalTitle = 'Update phone';
            modalInstance.result.then(function (modalData) {
                if (modalData._id !== null) {
                    for (var i=0; i < $scope.user.phones.length; i++) {
                        if ($scope.user.phones[i]._id === modalData._id) {
                            $scope.user.phones[i].owner = modalData.owner;
                            $scope.user.phones[i].type = modalData.type;
                            $scope.user.phones[i].number = modalData.number;
                        }
                    }
                } else {
                    $scope.user.phones.push(modalData);
                }
            });
        }
    };

    /*
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
                $scope.user.baptismCert = modalData.photo;
            }
        });
    };

    $scope.viewPhoto = function (username, photoType) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/viewPhoto.client.view.html',
            controller: 'newmodal as vm',
            size: 'lg',
            resolve: {
                modalData: function () {
                    return {
                        photoUrl: '/api/users/photo?username='+username+'&type=certificate',
                    };
                }
            }
        });
        modalInstance.modalTitle = 'View ' + photoType + ' photo';
    };
    */
}]);

angular.module('users').controller('regConfirm.modal', ['user', 'Authentication', '$scope', '$uibModalInstance', 'postEmailForm', function(user, Authentication, $scope, $uibModalInstance, postEmailForm) {
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
            user.current_reg.regConfirmEmail = '';
        }
    };

    $scope.printElement = function (id) {
        var elem = document.getElementById(id);
        var domClone = elem.cloneNode(true);

        var $printSection = document.getElementById('printSection');

        if (!$printSection) {
            $printSection = document.createElement('div');
            $printSection.id = 'printSection';
            document.body.appendChild($printSection);
        }

        $printSection.innerHTML = '';
        $printSection.appendChild(domClone);
        window.print();
    };

}]);

angular.module('users').controller('regHousehold.modal', ['household', '$scope', '$uibModalInstance', '$uibModal', function(household, $scope, $uibModalInstance, $uibModal) {

    $scope.household = household;

    $scope.ok = function () {
        $uibModalInstance.close($scope.household);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectedEmail = null;  // initialize our variable to null
    $scope.setClickedEmail = function(index) {  //function that sets the value of selectedRow to current index
        $scope.selectedEmail = index;
    };

    $scope.selectedPhone = null;  // initialize our variable to null
    $scope.setClickedPhone = function(index) {  //function that sets the value of selectedRow to current index
        $scope.selectedPhone = index;
    };

    $scope.addNewEmail = function(size) {
        $scope.modalData = {};
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
            controller: 'newmodal as vm',
            size: size,
            resolve: {
                modalData: function () {
                    return {
                        address: '',
                        owner: 'MOM'
                    };
                }
            }
        });
        modalInstance.modalTitle = 'Add new email';
        modalInstance.result.then(function (modalData) {
            $scope.household.emails.push(modalData);
        });
    };

    $scope.editEmail = function (index, size) {
        if (index !== null) {
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return $scope.household.emails[index];
                    }
                }
            });
            modalInstance.modalTitle = 'Update email';
            modalInstance.result.then(function (modalData) {
                if (modalData._id !== null) {
                    for (var i = 0; i < $scope.household.emails.length; i++) {
                        if ($scope.household.emails[i]._id === modalData._id) {
                            $scope.household.emails[i].owner = modalData.owner;
                            $scope.household.emails[i].address = modalData.address;
                        }
                    }
                } else {
                    $scope.household.emails.push(modalData);
                }
            });
        }
    };

    $scope.removeEmail = function (index) {
        if (index !== null) {
            $scope.household.emails.splice(index, 1);
        }
    };

    $scope.addNewPhone = function(size) {
        $scope.modalData = {};
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
            controller: 'newmodal as vm',
            size: size,
            resolve: {
                modalData: function () {
                    return {
                        number: '',
                        owner: 'MOM',
                        type: 'MOBILE'
                    };
                }
            }
        });
        modalInstance.modalTitle = 'Add new phone';
        modalInstance.result.then(function (modalData) {
            $scope.household.phones.push(modalData);
        });
    };

    $scope.removePhone = function (index) {
        if (index !== null) {
            $scope.household.phones.splice(index, 1);
        }
    };

    $scope.editPhone = function (index, size) {
        if (index !== null) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return $scope.household.phones[index];
                    }
                }
            });
            modalInstance.modalTitle = 'Update phone';
            modalInstance.result.then(function (modalData) {
                if (modalData._id !== null) {
                    for (var i=0; i < $scope.household.phones.length; i++) {
                        if ($scope.household.phones[i]._id === modalData._id) {
                            $scope.household.phones[i].owner = modalData.owner;
                            $scope.household.phones[i].type = modalData.type;
                            $scope.household.phones[i].number = modalData.number;
                        }
                    }
                } else {
                    $scope.household.phones.push(modalData);
                }
            });
        }
    };

}]);

angular.module('users').controller('showreport.modal', ['reportData', '$scope', '$uibModalInstance', '$uibModal', function(reportData, $scope, $uibModalInstance, $uibModal) {

    $scope.reportData = reportData;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

}]);

