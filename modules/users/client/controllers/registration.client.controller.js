'use strict';

angular.module('users').controller('RegistrationController', ['$scope', '$http', 'Authentication',
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
                    var studentids = new Array;
                    for(var i=0, len=response.length; i < len; i++){
                        studentids.push(response[i].studentId);
                    }

                    $http.get('/api/users?student_ids='+JSON.stringify(studentids)).success(function (response2) {
                        $scope.students = response2;

                        for(var i=0, len=response2.length; i < len; i++) {
                            response2[i].registrations = new Array;
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
]);