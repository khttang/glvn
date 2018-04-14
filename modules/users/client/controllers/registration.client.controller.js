'use strict';

angular.module('users')
    .controller('ShowRegisteredStudentsCtrl', ['$scope', '$http', '$filter', 'uiGridConstants',
        function($scope, $http, $filter, uiGridConstants) {

            $scope.filterOptions = {
                filterText: ''
            };

            $scope.onChangeSelection = function() {
                console.log('onChangeSelection');
            };

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'username', displayName: 'Student ID',
                        width: '9%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                    { field: 'firstName', displayName: 'First Name', width: '8%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                    { field: 'middleName',displayName: 'Middle Name', width: '8%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false},
                    { field: 'lastName', displayName: 'Last Name', width: '8%', enableColumnMenu: false},
                    { field: 'gender', displayName: 'Gender', enableFiltering: false, width: '7%', enableColumnMenu: false},
                    { field: 'birthDate',
                        cellFilter: 'date:\'MM/dd/yyyy\'', enableFiltering: false,
                        displayName: 'Birth Date', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'hasBaptismCert', displayName: 'Baptism Cert', width: '7%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                    { field: 'fatherFirstName', displayName: 'Father First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'fatherLastName', displayName: 'Father Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'motherFirstName', displayName: 'Mother First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'motherLastName', displayName: 'Mother Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'glClass', displayName: 'gl-class', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'vnClass', displayName: 'vn-class', width: '6%', enableCellEdit: false, enableColumnMenu: false}
                ],
                excludeProperties: '__metadata',
                enableFiltering: true,
                showGridFooter: true,
                multiSelect: false,
                enableRowSelection: true,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                }
            };

            $scope.filterUpdated = function () {
                $scope.gridOptions.filterOptions.filterText = 'username: ';
            };

            $scope.load = function () {
                $http.get('/api/users?class='+ApplicationConfiguration.regYear).success(function (response) {
                    $scope.gridOptions.data = response;
                }).error(function (response) {
                    $scope.error = response.message;
                });
            };
            $scope.load();
        }])
    .controller('ShowActiveStudentsCtrl', ['$scope', '$http', '$filter', 'uiGridConstants',
    function($scope, $http, $filter, uiGridConstants) {

        $scope.filterOptions = {
            filterText: ''
        };

        $scope.onChangeSelection = function() {
            console.log('onChangeSelection');
        };

        var registrationTemplate = '<div><select><option ng-repeat="r in row.entity.registrations">{{r.year}}: {{r.glClass}} {{r.vnClass}} {{r.status}}</option></select> </div>';

        $scope.gridOptions = {
            columnDefs: [
                { field: 'username', displayName: 'Student ID',
                    width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'firstName', displayName: 'First Name', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'middleName',displayName: 'Middle Name', width: '10%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'lastName', displayName: 'Last Name', width: '10%', enableColumnMenu: false},
                { field: 'gender', displayName: 'Gender', enableFiltering: false, width: '8%', enableColumnMenu: false},
                { field: 'birthDate',
                    cellFilter: 'date:\'MM/dd/yyyy\'', enableFiltering: false,
                    displayName: 'Birth Date', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'hasBaptismCert', displayName: 'Baptism Cert', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'fatherFirstName', displayName: 'Father First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'fatherLastName', displayName: 'Father Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherFirstName', displayName: 'Mother First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherLastName', displayName: 'Mother Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'registrations', displayName: 'Registrations',
                    enableFiltering: false, cellTemplate: registrationTemplate,
                    width: '24%', enableCellEdit: false, enableColumnMenu: false }
            ],
            excludeProperties: '__metadata',
            enableFiltering: true,
            showGridFooter: true,
            multiSelect: false,
            enableRowSelection: true,
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.filterUpdated = function () {
            $scope.gridOptions.filterOptions.filterText = 'username: ';
        };

        $scope.load = function () {
            $http.get('/api/users').success(function (response) {
                $scope.gridOptions.data = response;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
        $scope.load();
    }])
    .controller('ShowIntakeByHouseholdCtrl', ['$scope', '$http', '$filter', '$uibModal', 'uiGridConstants', 'postEmailForm',
        function($scope, $http, $filter, $uibModal, uiGridConstants, postEmailForm) {

            function calcRegFee(glClass) {
                var regFee = 100;
                if (glClass === 'pre-con' || glClass === 'confirmation') {
                    regFee = 150;
                }
                return regFee;
            }

            function getNextGL(currentGl) {
                if (currentGl === 'gl-01') {
                    return 'gl-02';
                }
                if (currentGl === 'gl-02') {
                    return 'gl-03';
                }
                if (currentGl === 'gl-03') {
                    return 'gl-04';
                }
                if (currentGl === 'gl-04') {
                    return 'gl-05';
                }
                if (currentGl === 'gl-05') {
                    return 'gl-06';
                }
                if (currentGl === 'gl-06') {
                    return 'gl-07';
                }
                if (currentGl === 'gl-07') {
                    return 'gl-08';
                }
                if (currentGl === 'gl-08') {
                    return 'pre-con';
                }
                if (currentGl === 'pre-con') {
                    return 'confirmation';
                }
                return '';
            }

            function getNextVN(currentVn) {
                if (currentVn === 'vn-01') {
                    return 'vn-02';
                }
                if (currentVn === 'vn-02') {
                    return 'vn-03';
                }
                if (currentVn === 'vn-03') {
                    return 'vn-04';
                }
                if (currentVn === 'vn-04') {
                    return 'vn-05';
                }
                if (currentVn === 'vn-05') {
                    return 'vn-06';
                }
                if (currentVn === 'vn-06') {
                    return 'vn-07';
                }
                if (currentVn === 'vn-07') {
                    return 'vn-08';
                }
                return '';
            }

            function prefillRegistration(registrations) {
                for (var i = 0, len = registrations.length; i < len; i++) {
                    if (registrations[i].year === (ApplicationConfiguration.regYear-1)) {
                        var reg = {
                            year: ApplicationConfiguration.regYear,
                            glClass: getNextGL(registrations[i].glClass),
                            vnClass: getNextVN(registrations[i].vnClass),
                            schoolGrade: (parseInt(registrations[i].schoolGrade) + 1).toString()
                        };
                        return reg;
                    }
                }
            }

            $scope.filterOptions = {
                filterText: ''
            };

            $scope.onChangeSelection = function() {
                console.log('onChangeSelection');
            };

            $scope.createNewStudent =  function(household) {
                $scope.modalData = {};

                var user = {
                    householdId: household.householdId,
                    fatherLastName: household.fatherLastName,
                    fatherFirstName: household.fatherFirstName,
                    motherLastName: household.motherLastName,
                    motherFirstName: household.motherFirstName,
                    address: household.address,
                    city: household.city,
                    zipCode: household.zipCode,
                    emails: household.emails,
                    phones: household.phones,
                    emergency: household.emergency,
                    current_reg: {}
                };

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'modules/users/client/views/register.client.view.html',
                    controller: 'regstudent.modal as vm',
                    size: 'lg',
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
                modalInstance.reg_step = 'approve';
                modalInstance.modalTitle = 'Register new student for school Year '+ new Date().getFullYear();
                modalInstance.result.then(function (modalData) {
                    user.current_reg.reviewedBy = $scope.authentication.user.fullName;
                    user.current_reg.receivedBy = $scope.authentication.user.fullName;
                    user.current_reg.regFee = calcRegFee(user.current_reg.glClass);
                    user.current_reg.regPaid = 0;
                    user.current_reg.status = 'APPROVED';
                    user.actor = $scope.authentication.user.username;
                    $http.post('/api/users', user).success(function () {
                        $scope.success = 'Completed registration for student ' + user.username + '. Congratulations!';
                        $scope.load();
                    });
                });

            };

            $scope.updateRegStudent = function(household, studentId) {
                $scope.modalData = {};

                var user = {};

                $http.get('/api/users?student_id='+studentId+'&household_id='+household.householdId).success(function (response) {
                    user = response;
                    if (user.current_reg === undefined) {
                        user.current_reg = prefillRegistration(user.registrations);
                    }
                    user.householdId = household.householdId;
                    user.fatherLastName = household.fatherLastName;
                    user.fatherFirstName = household.fatherFirstName;
                    user.motherLastName = household.motherLastName;
                    user.motherFirstName = household.motherFirstName;
                    user.address = household.address;
                    user.city = household.city;
                    user.zipCode = household.zipCode;
                    user.emergency = household.emergency;

                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/register.client.view.html',
                        controller: 'regstudent.modal as vm',
                        size: 'lg',
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
                    modalInstance.reg_step = 'approve';
                    modalInstance.modalTitle = 'Register ' + user.firstName + ' ' + user.lastName + ' for school Year '+ new Date().getFullYear();
                    modalInstance.result.then(function (modalData) {
                        user.current_reg.reviewedBy = $scope.authentication.user.fullName;
                        user.current_reg.receivedBy = $scope.authentication.user.fullName;
                        user.actor = $scope.authentication.user.username;
                        if (user.current_reg.status === undefined) {
                            user.current_reg.regFee = calcRegFee(user.current_reg.glClass);
                            user.current_reg.regPaid = 0;
                            user.current_reg.status = 'RECEIVED';
                        }

                        $http.put('/api/users', user).success(function () {
                            $scope.success = 'Completed registration for student ' + user.username + '. Congratulations!';
                            $scope.load();
                        });
                    });
                });
            };

            $scope.payFee = function(household) {
                var currentyr = ApplicationConfiguration.regYear;
                $scope.modalData = {};

                $http.get('/api/households/registrations?household_id='+household.householdId+'&reg_year='+currentyr).success(function (response) {
                    household.current_regs = response;
                    household.payment = {};

                    var feeAmount = 0;
                    var paidAmount = 0;
                    for (var i = 0, len = household.current_regs.length; i < len; i++) {
                        feeAmount += parseInt(household.current_regs[i].regFee);
                        if (household.current_regs[i].regPaid !== null) {
                            paidAmount += parseInt(household.current_regs[i].regPaid);
                        }
                        household.payment.regTeacherExempt = household.current_regs[i].regTeacherExempt;
                    }
                    household.payment.regFee = String(feeAmount - paidAmount);

                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'modules/users/client/views/payfee.client.view.html',
                        controller: 'payFee.modal as vm',
                        size: 'lg',
                        resolve: {
                            payment: function() {
                                return household.payment;
                            },
                            registrations: function () {
                                return household.current_regs;
                            }
                        }
                    });
                    modalInstance.modalTitle = 'Complete registration for school Year '+ currentyr;
                    modalInstance.result.then(function (modalData) {
                        household.payment.reviewedBy = $scope.authentication.user.fullName;
                        household.payment.status = 'APPROVED';
                        household.actor = $scope.authentication.user.username;

                        $http.post('/api/households/payment', household).success(function () {
                            $scope.success = 'Registration completed!';
                            $scope.load();
                        });
                    });
                });
            };

            //var childrenTemplate = '<div><select ng-model="row.entity.index"><option value="{{r.username}}" ng-repeat="r in row.entity.children track by r.username">{{r.fullname}}  (id: {{r.username}})</option></select> </div>';
            var childrenTemplate='<div><select ng-model="row.entity.index"><option value="{{r.username}}" ng-repeat="r in row.entity.children">{{r.fullname}}  (id: {{r.username}})</option></select> </div>';

            $scope.gridOptions = {
                data: 'GridData',
                columnDefs: [
                    { field: 'fatherFirstName', displayName: 'Father First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'fatherLastName', displayName: 'Father Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'motherFirstName', displayName: 'Mother First', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'motherLastName', displayName: 'Mother Last', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'children', displayName: 'Children', enableFiltering: false, cellTemplate: childrenTemplate, width: '26%', enableCellEdit: false, enableColumnMenu: false },
                    { field: 'register', displayName: '', width: '3%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false,
                        cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.updateRegStudent(row.entity, row.entity.index)"><i class="glyphicon glyphicon-edit"></i></button>'},
                    { field: 'addChild', displayName: '', width: '3%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false,
                        cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.createNewStudent(row.entity)"><i class="glyphicon glyphicon-plus-sign"></i></button>'},
                    { field: 'payfee', displayName: '', width: '3%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false,
                        cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.payFee(row.entity)"><i class="glyphicon glyphicon-thumbs-up"></i></button>'},
                    { field: 'address', displayName: 'Address', width: '18%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'city', displayName: 'City', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                    { field: 'zipCode', displayName: 'Zip', width: '6%', enableCellEdit: false, enableColumnMenu: false}
                ],
                excludeProperties: '__metadata',
                enableFiltering: true,
                showGridFooter: true,
                multiSelect: false,
                enableRowSelection: true,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                }
            };

            $scope.filterUpdated = function () {
                $scope.gridOptions.filterOptions.filterText = 'username: ';
            };

            $scope.load = function () {

                $http.get('/api/households?').success(function (response) {
                    $scope.GridData = response;

                }).error(function (response) {
                    $scope.error = response.message;
                });
            };
            $scope.load();
        }]);