'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
    function ($scope, $state, Authentication, Menus) {
        // Expose view variables
        $scope.$state = $state;
        $scope.authentication = Authentication;

        // Get the topbar menu
        $scope.menu = Menus.getMenu('topbar');

        // Toggle the menu items
        $scope.isCollapsed = false;
        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        this.isAdminUser = function() {
            var admin = false;
            if ($scope.authentication.user) {
                for (var i = 0, len = $scope.authentication.user.roles.length; i < len; i++) {
                    if ($scope.authentication.user.roles[i] === 'ADMIN') {
                        return true;
                    }
                }
            }
            return admin;
        }
    }
]);
