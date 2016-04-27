'use strict';

angular.module('users')
    .directive('photoCapture', function () {

    var CropImageCtrl = function($scope, $element, $attrs) {
        $scope.my_image='';
    };

    return {
        restrict: 'E', //E = element, A = attribute, C = class, M = comment
        scope: {
            myCroppedImage: '=ngModel'
        },
        controller: CropImageCtrl,

        templateUrl: 'modules/users/client/views/photo-capture.template.html',
        link: function (scope, elem, attrs) {
            Webcam.set({
                width: 260,
                height: 240,
                dest_width: 260,
                dest_height: 240,
                image_format: 'jpeg',
                jpeg_quality: 90,
                force_flash: false,
                flip_horiz: true,
                fps: 45
            });

            Webcam.attach('#my_camera');

            scope.start_capture = function (index) {
                scope.captureMode = true;
            };

            scope.take_snapshot = function () {
                Webcam.snap( function(data_uri) {
                    scope.my_image = data_uri;
                } );
                scope.captureMode = false;
            };
        }
    };
});

