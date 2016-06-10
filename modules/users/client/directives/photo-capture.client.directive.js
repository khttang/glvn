'use strict';

angular.module('users')
    .directive('photoCapture', function () {

    var CropImageCtrl = function($scope, $element, $attrs) {
        $scope.my_image='';

        $scope.getTemplateUrl = function() {
            if ($scope.myType === 'photo')
                return 'modules/users/client/views/photo-capture.template.html';
            if ($scope.myType === 'certificate')
                return 'modules/users/client/views/photo-capture.template.html';
        }
    };

    var contentURL;

    return {
        restrict: 'E', //E = element, A = attribute, C = class, M = comment
        scope: {
            myCroppedImage: '=ngModel',
            myImgWidth: '@imgWidth',
            myImgHeight: '@imgHeight',
            myType: '@type'
        },
        controller: CropImageCtrl,
        link: function (scope, elem, attrs) {
            Webcam.set({
                width: 260,
                height: 240,
                dest_width: scope.myImgWidth,
                dest_height: scope.myImgHeight,
                image_format: 'jpeg',
                jpeg_quality: 100,
                force_flash: false,
                flip_horiz: false,
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
        },
        templateUrl: function(tElement,tAttrs){
            if (tAttrs.type === 'certificate') {
                return 'modules/users/client/views/certificate-capture.template.html';
            } else {
                return 'modules/users/client/views/photo-capture.template.html';
            }
        }
    }
});

