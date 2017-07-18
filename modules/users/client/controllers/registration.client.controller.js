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
                $http.get('/api/users?class='+new Date().getFullYear()).success(function (response) {
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
                var lateDate = new Date('2017-08-01');
                var curDate = new Date();
                var regFee = 0;
                if (glClass === 'pre-con' || glClass === 'confirmation') {
                    regFee = 150;
                } else {
                    regFee = 100;
                }

                if (curDate >= lateDate) {
                    regFee += 50;
                }

                return regFee;
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
                    user.current_reg.reviewedBy = $scope.authentication.user.firstName + ' ' + $scope.authentication.user.lastName;
                    user.current_reg.receivedBy = $scope.authentication.user.firstName + ' ' + $scope.authentication.user.lastName;
                    user.current_reg.regFee = calcRegFee(user.current_reg.glClass);
                    user.current_reg.status = 'APPROVED';
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
                        user.current_reg = {};
                    }
                    user.householdId = household.householdId;
                    user.fatherLastName = household.fatherLastName;
                    user.fatherFirstName = household.fatherFirstName;
                    user.motherLastName = household.motherLastName;
                    user.motherFirstName = household.motherFirstName;
                    user.address = household.address;
                    user.city = household.city;
                    user.zipCode = household.zipCode;

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
                        user.current_reg.reviewedBy = $scope.authentication.user.firstName + ' ' + $scope.authentication.user.lastName;
                        user.current_reg.receivedBy = $scope.authentication.user.firstName + ' ' + $scope.authentication.user.lastName;
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
                var currentyr = new Date().getFullYear();
                $scope.modalData = {};

                $http.get('/api/households/registrations?household_id='+household.householdId+'&reg_year='+currentyr).success(function (response) {
                    household.current_regs = response;
                    household.payment = { regFee: 0, regTeacherExempt: false };
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
                    modalInstance.modalTitle = 'Complete registration for school Year '+ new Date().getFullYear();
                    modalInstance.result.then(function (modalData) {
                        household.payment.reviewedBy = $scope.authentication.user.firstName + ' ' + $scope.authentication.user.lastName;
                        household.payment.status = 'APPROVED';

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