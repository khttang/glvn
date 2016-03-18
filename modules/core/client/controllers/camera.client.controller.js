'use strict';

angular.module('core').controller('CameraController', ['$scope',
    function ($scope) {
        $scope.onError = function (err) {};
        $scope.onStream = function (stream) {};
        $scope.onSuccess = function () {};

        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 800,
            videoWidth: 600,
            video: null // Will reference the video element on success
        };
    }
]);
