'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {

        // Users state routing
        $stateProvider
            .state('teachers', {
                url: '/teachers',
                templateUrl: 'modules/users/client/views/teachers.client.view.html'
            })
            .state('students', {
                url: '/students',
                templateUrl: 'modules/users/client/views/authentication/students.client.view.html'
            })
            .state('hphhs', {
                url: '/hphhs',
                templateUrl: 'modules/users/client/views/authentication/hphhs.client.view.html'
            })
            .state('registration', {
                url: '/registration_intake',
                data: {
                    roles: ['ADMIN']
                },
                templateUrl: 'modules/users/client/views/registration_intake.client.view.html'
            })
            .state('approval', {
                url: '/registration_approval',
                data: {
                    roles: ['ADMIN']
                },
                templateUrl: 'modules/users/client/views/registration_approval.client.view.html'
            })
            .state('settings', {
                abstract: true,
                url: '/settings',
                templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
                data: {
                    roles: ['STUDENT', 'ADMIN']
                }
            })
            .state('settings.profile', {
                url: '/profile',
                templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
            })
            .state('settings.password', {
                url: '/password',
                templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
            })
            .state('settings.accounts', {
                url: '/accounts',
                templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
            })
            .state('settings.picture', {
                url: '/picture',
                templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
            })
            .state('authentication', {
                abstract: true,
                url: '/authentication',
                templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
            })
            .state('authentication.signup', {
                url: '/signup',
                templateUrl: 'modules/users/client/views/signup.client.view.html'
            })
            .state('authentication.signin', {
                url: '/signin?err',
                templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
            })
            .state('authentication.testing', {
                url: '/testing',
                templateUrl: 'modules/users/client/views/authentication/testing.client.view.html'
            })
            .state('password', {
                abstract: true,
                url: '/password',
                template: '<ui-view/>'
            })
            .state('password.forgot', {
                url: '/forgot',
                templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
            })
            .state('password.reset', {
                abstract: true,
                url: '/reset',
                template: '<ui-view/>'
            })
            .state('password.reset.invalid', {
                url: '/invalid',
                templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
            })
            .state('password.reset.success', {
                url: '/success',
                templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
            })
            .state('password.reset.form', {
                url: '/:token',
                templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
            });
    }
]);

