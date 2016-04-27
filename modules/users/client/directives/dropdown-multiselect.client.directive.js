'use strict';

angular.module('users')
    .directive('dropdownMultiselect', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            options: '=',
            //select: '&onSelect',
            pre_selected: '=preSelected',
            dropdownTitle: '@'
        },
        template: '<div class=\'btn-group\' data-ng-class=\'{open: open}\'>' +
        '<button class=\'btn btn-small\'>{{dropdownTitle}}</button>' +
        '<button class=\'btn btn-small dropdown-toggle\' data-ng-click=\'open=!open;openDropDown()\'><span class=\'caret\'></span></button>' +
        '<ul class=\'dropdown-menu scrollable-menu\' aria-labelledby=\'dropdownMenu\'>' +
        '<li><input type=\'checkbox\' data-ng-change=\'checkAllClicked()\' data-ng-model=checkAll> Check All</li>' +
        '<li class=\'divider\'></li>' +
        '<li data-ng-repeat=\'option in options\'> <input type=\'checkbox\' data-ng-change=\'setSelectedItem(option.id)\' ng-model=\'selectedItems[option.id]\'>{{option.name}}</li>' +
        '</ul>' +
        '</div>',
        controller: function ($scope) {
            $scope.selectedItems = {};
            $scope.checkAll = false;

            init();

            function init() {
                console.log('init function');
                for (var i = 0; i < $scope.pre_selected.length; i++) {
                    $scope.model.push($scope.pre_selected[i].id);
                    $scope.selectedItems[$scope.pre_selected[i].id] = true;
                }
                if ($scope.pre_selected.length === $scope.options.length) {
                    $scope.checkAll = true;
                }
            }

            $scope.openDropDown = function () {
                console.log('hi');
            };

            $scope.checkAllClicked = function () {
                if ($scope.checkAll) {
                    selectAll();
                } else {
                    deselectAll();
                }
            };

            function selectAll() {
                $scope.model = [];
                $scope.selectedItems = {};
                angular.forEach($scope.options, function (option) {
                    $scope.model.push(option.id);
                });
                angular.forEach($scope.model, function (id) {
                    $scope.selectedItems[id] = true;
                });
                console.log($scope.model);
            }

            function deselectAll() {
                $scope.model = [];
                $scope.selectedItems = {};
                console.log($scope.model);
            }

            $scope.setSelectedItem = function (id) {
                var filteredArray = [];
                if ($scope.selectedItems[id] === true) {
                    $scope.model.push(id);
                } else {
                    filteredArray = $scope.model.filter(function (value) {
                        return value !== id;
                    });
                    $scope.model = filteredArray;
                    $scope.checkAll = false;
                }
                console.log(filteredArray);
                return false;
            };
        }
    };
});