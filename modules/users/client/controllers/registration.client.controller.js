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
]).controller('ShowRegCtrl', ['$scope', '$http', '$filter', 'uiGridConstants',
    function($scope, $http, $filter, uiGridConstants) {

        $scope.glClasses = [
            { 'name': 'GL-01', 'id': 'gl-01' },
            { 'name': 'GL-02', 'id': 'gl-02' },
            { 'name': 'GL-03', 'id': 'gl-03' },
            { 'name': 'GL-04', 'id': 'gl-04' },
            { 'name': 'GL-05', 'id': 'gl-05' },
            { 'name': 'GL-06', 'id': 'gl-06' },
            { 'name': 'GL-07', 'id': 'gl-07' },
            { 'name': 'GL-08', 'id': 'gl-08' },
            { 'name': 'PRE-CON', 'id': 'pre-con' },
            { 'name': 'CONFIRMATION', 'id': 'confirmation' }
        ];

        $scope.vnClasses = [
            { 'name': 'VN-01', 'id': 'vn-01' },
            { 'name': 'VN-02', 'id': 'vn-02' },
            { 'name': 'VN-03', 'id': 'vn-03' },
            { 'name': 'VN-04', 'id': 'vn-04' },
            { 'name': 'VN-05', 'id': 'vn-05' },
            { 'name': 'VN-06', 'id': 'vn-06' },
            { 'name': 'VN-07', 'id': 'vn-07' },
            { 'name': 'VN-08', 'id': 'vn-08' },
            { 'name': 'VN-09', 'id': 'vn-09' }
        ];
        $scope.selected_vnclasses = [];
        $scope.selected_glclasses = [];
        $scope.preselected_gl = [];
        $scope.preselected_vn = [];

        $scope.filterOptions = {
            filterText: ''
        };

        // begin tabs control
        $scope.tabManager = {};

        $scope.tabManager.tabItems = [];

        $scope.tabManager.checkIfMaxTabs = function(){
            var max = 4;
            var i = $scope.tabManager.tabItems.length;
            if(i > max){
                return true;
            }
            return false;
        };

        $scope.tabManager.getTitle = function(tabInfo){
            console.log('[ title ] -> ',tabInfo.title);
            tabInfo.title.substr(0,10);
        };

        $scope.tabManager.resetSelected = function(){
            angular.forEach($scope.tabManager.tabItems, function(pane) {
                pane.selected = false;
            });
        };

        $scope.tabManager.addTab = function(){
            if($scope.tabManager.checkIfMaxTabs()){
                alert('[Max Tabs] You have opened max tabs for this page.');
                return;
            }
            $scope.tabManager.resetSelected();
            var i = ($scope.tabManager.tabItems.length +1);
            $scope.tabManager.tabItems.push({
                title: 'Tab No: ' + i,
                content: 'Lores sum ep sum news test [' + i +']',
                selected: true
            });
        };

        //to select the tab
        $scope.tabManager.select = function(i) {
            angular.forEach($scope.tabManager.tabItems, function(tabInfo) {
                tabInfo.selected = false;
            });
            $scope.tabManager.tabItems[i].selected = true;
        };


        // init the first active tab
        //$scope.tabManager.select(0);

        // end tabs control

        var phoneTemplate = '<div><select><option ng-repeat="p in row.entity.phones">{{p.owner}} {{p.type}}: {{p.number | phonenumber}}</option></select> </div>';
        var emailTemplate = '<div><select><option ng-repeat="e in row.entity.emails">{{e.owner}}: {{e.address}}</option></select> </div>';
        var registrationTemplate = '<div><select><option ng-repeat="r in row.entity.registrations">{{r.year}}: {{r.glClass}} {{r.vnClass}} {{r.status}}</option></select> </div>';

        $scope.gridOptions = {
            columnDefs: [
                { field: 'username', displayName: 'Student ID', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'saintName',displayName: 'St. Name', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'firstName', displayName: 'First Name', width: '10%', resizable: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'middleName',displayName: 'Middle Name', width: '10%', enableFiltering: false, enableCellEdit: false, enableColumnMenu: false},
                { field: 'lastName', displayName: 'Last Name', width: '10%', enableColumnMenu: false},
                { field: 'gender', displayName: 'Gender', enableFiltering: false, width: '8%', enableColumnMenu: false},
                { field: 'birthDate',
                    cellFilter: 'date:\'MM/dd/yyyy\'', enableFiltering: false,
                    displayName: 'Birth Date', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'phones', displayName: 'Phones',
                    cellTemplate: phoneTemplate, enableFiltering: false,
                    width: '22%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'emails', displayName: 'Emails',
                    cellTemplate: emailTemplate, enableFiltering: false,
                    width: '20%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'registrations', displayName: 'Registrations',
                    enableFiltering: false, cellTemplate: registrationTemplate,
                    width: '20%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'address', displayName: 'Address', width: '22%', enableCellEdit: false, enableColumnMenu: false },
                { field: 'city',displayName: 'City', width: '8%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'zipCode', displayName: 'Zip', width: '5%',enableCellEdit: false,  enableColumnMenu: false},
                { field: 'fatherFirstName', displayName: 'Father First', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'fatherLastName', displayName: 'Father Last', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherFirstName', displayName: 'Mother First', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'motherLastName', displayName: 'Mother Last', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'userType', displayName: 'User Type', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'status', displayName: 'User Status', width: '10%', enableCellEdit: false, enableColumnMenu: false},
                { field: 'roles', displayName: 'Roles',
                    enableFiltering: false, width: '10%', enableCellEdit: false, enableColumnMenu: false}
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
                    for(var i=0, len=response.length; i < len; i++) {
                        response[i].registrations = [];
                        for (var j = 0, len2=response2.length; j < len2; j++) {
                            if (response[i].username === response2[j].studentId) {
                                response[i].registrations.push(response2[j]);
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

        $scope.load();

    }]);