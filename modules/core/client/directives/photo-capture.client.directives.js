'use strict';

// $$$KT 'ngImgCrop'
angular.module('core', [])
    .directive('photoCapture', function () {

    var CropImageCtrl = function($scope, $element, $attrs) {
        $scope.myImage='';
        $scope.myCroppedImage='';
        $scope.cropType='rectangle';
    }

    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment
        scope: {
            //@ reads the attribute value, = provides two-way binding, & works with functions
            title: '@'
        },
        controller: CropImageCtrl,
        templateUrl: 'modules/core/client/views/directives/photo-capture.view.html',
        link: function (scope, elem, attrs) {
            Webcam.set({
                width: 180,  // 320
                height: 260,   // 240
                dest_width: 320,
                dest_height: 240,
                image_format: 'jpeg',
                jpeg_quality: 90,
                force_flash: false,
                flip_horiz: true,
                fps: 45
            });

            Webcam.attach("#my_camera");

            scope.start_capture = function (index) {
                scope.captureMode = true;
            };

            scope.take_snapshot = function () {
                Webcam.snap( function(data_uri) {
                    document.getElementById('my_photo_capture').innerHTML = '<img src="'+data_uri+'"/>';
                } );
                scope.captureMode = false;
            }
        }
    }
});
