'use strict';

angular.module('users')
    .controller('RegistrationController', ['$scope', '$http', 'Authentication',
    function ($scope, $http, Authentication) {

        $scope.itemClasses = [
            {id: 'gl-01', label: 'gl-01'},
            {id: 'gl-02', label: 'gl-02'},
            {id: 'gl-03', label: 'gl-03'},
            {id: 'gl-04', label: 'gl-04'},
            {id: 'gl-05', label: 'gl-05'},
            {id: 'gl-06', label: 'gl-06'},
            {id: 'gl-07', label: 'gl-07'},
            {id: 'gl-08', label: 'gl-08'},
            {id: 'pre-con', label: 'pre-con'},
            {id: 'confirmation', label: 'confirmation'},
            {id: 'vn-01', label: 'vn-01'},
            {id: 'vn-02', label: 'vn-02'},
            {id: 'vn-03', label: 'vn-03'},
            {id: 'vn-04', label: 'vn-04'},
            {id: 'vn-05', label: 'vn-05'},
            {id: 'vn-06', label: 'vn-06'},
            {id: 'vn-07', label: 'vn-07'},
            {id: 'vn-08', label: 'vn-08'},
            {id: 'vn-09', label: 'vn-09'}
        ];

        $scope.selectAction = function() {
            var currentyr = new Date().getFullYear();
            var label = $scope.selected.label;
            $scope.students = null;
            $http.get('/api/users/registrations?class='+label+'&year='+currentyr).success(function (response) {
                if (response.length > 0) {
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
                }
            }).error(function (response) {
                $scope.error = response.message;
            });
        };
    }
]).controller('MyAppCtrl', ['$scope', '$http', '$filter', 'uiGridConstants',
    function($scope, $http, $filter, uiGridConstants) {

        $scope.filterOptions = {
            filterText: ''
        };

        var phoneTemplate = '<div><select><option ng-repeat="p in row.entity.phones">{{p.owner}} {{p.type}}: {{p.number | phonenumber}}</option></select> </div>';
        var emailTemplate = '<div><select><option ng-repeat="e in row.entity.emails">{{e.owner}}: {{e.address}}</option></select> </div>';
        var registrationTemplate = '<div><select><option ng-repeat="r in row.entity.registrations">{{r.year}}: {{r.glClass}} {{r.vnClass}}</option></select> </div>';

        $scope.gridOptions = {
            columnDefs: [
                { field: 'username', displayName: 'Student ID', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'saintName',displayName: 'St. Name', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'firstName', displayName: 'First Name', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'middleName',displayName: 'Middle Name', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'lastName', displayName: 'Last Name', width: '10%', enableColumnMenu: false},
                { field: 'gender', displayName: 'Gender', width: '8%', enableColumnMenu: false},
                { field: 'birthDate',
                    cellFilter: 'date:\'MM/dd/yyyy\'',
                    displayName: 'Birth Date', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'phones', displayName: 'Phones',
                    cellTemplate: phoneTemplate,
                    width: '22%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'emails', displayName: 'Emails',
                    cellTemplate: emailTemplate,
                    width: '20%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'registrations', displayName: 'Registrations',
                    cellTemplate: registrationTemplate,
                    width: '16%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'address', displayName: 'Address', width: '22%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'city',displayName: 'City', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'zipCode', displayName: 'Zip', width: '5%',enableCellEdit: false,  enableColumnMenu: false},
                { field: 'fatherFirstName', displayName: 'Father First', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'fatherLastName', displayName: 'Father Last', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherFirstName', displayName: 'Mother First', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherLastName', displayName: 'Mother Last', width: '10%', enableCellEdit: false, enableColumnMenu: false}
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

        }

        $scope.load();

    }]);