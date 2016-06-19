'use strict';

angular.module('core')
    .factory('alert', function($uibModal) {
        function show(action, event) {
            return $uibModal.open({
                templateUrl: 'modules/core/client/views/modalContent.html',
                controller: function () {
                    var vm = this;
                    vm.action = action;
                    vm.event = event;
                },
                controllerAs: 'vm'
            });
        }

        return {
            show: show
        }
    })
    .controller('CalendarEventsCtrl', function (alert, moment) {
        var vm = this;

        vm.events = [
            {
                title: 'Editable event',
                type: 'warning',
                startsAt: moment().startOf('month').toDate(),
                editable: true,
                deletable: false
            }, {
                title: 'Deletable event',
                type: 'info',
                startsAt: moment().startOf('month').toDate(),
                deletable: true,
                editable: false
            }, {
                title: 'Non editable and deletable event',
                type: 'important',
                startsAt: moment().startOf('month').toDate(),
                editable: false,
                deletable: false
            }
        ];

        vm.calendarView = 'month';
        vm.viewDate = moment().startOf('month').toDate();
        vm.isCellOpen = true;
        vm.viewChangeEnabled = true;

        vm.viewChangeClicked = function(date, nextView) {
            return vm.viewChangeEnabled;
        };

        vm.eventEdited = function (event) {
            alert.show('Edited', event);
        };

        vm.eventDeleted = function (event) {
            alert.show('Deleted', event);
        };

        vm.eventClicked = function(event) {
            alert.show('Clicked', event);
        };

        vm.eventTimesChanged = function(event) {
            alert.show('Dropped or resized', event);
        };

        vm.toggle = function($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            event[field] = !event[field];
        };

    }
);