'use strict';

angular.module('users').controller('UsersController', ['$scope', '$stateParams', 'Authentication',
    function ($scope, $stateParams, Authentication) {

    }
]);

angular.module('users').controller('UsersCreateController', ['$scope', '$http', 'userService', '$uibModal', '$log',
    function ($scope, $http, userService, $uibModal, $log) {

        $scope.user = userService.getUser();

        this.saveUserInfo = function(userType, registration) {
            if (registration === 'update') {
                $http.put('/api/users', $scope.user).success(function (response) {

                }).error(function (response) {
                    $scope.error = response.message;
                });
            } else {
                var uri = (registration === 'register') ? '/api/users/register' : '/api/users';
                $http.post(uri, $scope.user).success(function (response) {

                }).error(function (response) {
                    $scope.error = response.message;
                });
            }

            userService.clearUser();
            $scope.user = userService.getUser();
        };
        
        this.addNewEmail = function(size) {
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return {
                            address: '',
                            owner: 'MOM'
                        };
                    }
                }
            });
            modalInstance.modalTitle = 'Add new email';
            modalInstance.result.then(function (modalData) {
                $scope.user.emails.push(modalData);
            });
        };

        this.editEmail = function (index, size) {
            if (index !== null) {
                $scope.modalData = {};
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'modules/users/client/views/authentication/addEmail.client.view.html',
                    controller: 'newmodal as vm',
                    size: size,
                    resolve: {
                        modalData: function () {
                            return $scope.user.emails[index];
                        }
                    }
                });
                modalInstance.modalTitle = 'Update email';
                modalInstance.result.then(function (modalData) {
                    if (modalData._id !== null) {
                        for (var i = 0; i < $scope.user.emails.length; i++) {
                            if ($scope.user.emails[i]._id === modalData._id) {
                                $scope.user.emails[i].owner = modalData.owner;
                                $scope.user.emails[i].address = modalData.address;
                            }
                        }
                    } else {
                        $scope.user.emails.push(modalData);
                    }
                });
            }
        };

        this.removeEmail = function (index) {
            if (index !== null) {
                $scope.user.emails.splice(index, 1);
            }
        };

        this.addNewPhone = function(size) {
            $scope.modalData = {};
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
                controller: 'newmodal as vm',
                size: size,
                resolve: {
                    modalData: function () {
                        return {
                            number: '',
                            owner: 'MOM',
                            type: 'MOBILE'
                        };
                    }
                }
            });
            modalInstance.modalTitle = 'Add new phone';
            modalInstance.result.then(function (modalData) {
                $scope.user.phones.push(modalData);
            });
        };

        this.removePhone = function (index) {
            if (index !== null) {
                $scope.user.phones.splice(index, 1);
            }
        };

        this.editPhone = function (index, size) {
            if (index !== null) {
                $scope.modalData = {};

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'modules/users/client/views/authentication/addPhone.client.view.html',
                    controller: 'newmodal as vm',
                    size: size,
                    resolve: {
                        modalData: function () {
                            return $scope.user.phones[index];
                        }
                    }
                });
                modalInstance.modalTitle = 'Update phone';
                modalInstance.result.then(function (modalData) {
                    if (modalData._id !== null) {
                        for (var i=0; i < $scope.user.phones.length; i++) {
                            if ($scope.user.phones[i]._id === modalData._id) {
                                $scope.user.phones[i].owner = modalData.owner;
                                $scope.user.phones[i].type = modalData.type;
                                $scope.user.phones[i].number = modalData.number;
                            }
                        }
                    } else {
                        $scope.user.phones.push(modalData);
                    }
                });
            }
        };

        this.snapPhoto = function (photoType) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/snapPhoto.client.view.html',
                controller: 'newmodal as vm',
                size: 'lg',
                resolve: {
                    modalData: function () {
                        return {
                            photoType: photoType,
                            photo: ''
                        };
                    }
                }
            });
            modalInstance.modalTitle = 'Take ' + photoType + ' photo';
            modalInstance.result.then(function (modalData) {
                $scope.user.picture = modalData.photo;
            });
        };

        this.selectPhoto = function (photoType) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/selectPhoto.client.view.html',
                controller: 'newmodal as vm',
                size: 'lg',
                resolve: {
                    modalData: function () {
                        return {
                            photoType: photoType,
                            photo: ''
                        };
                    }
                }
            });
            modalInstance.modalTitle = 'Upload ' + photoType + ' photo';
            modalInstance.result.then(function (modalData) {
                $scope.user.picture = modalData.photo;
            });
        };

        this.viewPhoto = function (photoType) {
            $scope.modalData = {};

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/users/client/views/authentication/viewPhoto.client.view.html',
                controller: 'newmodal as vm',
                size: 'lg',
                resolve: {
                    modalData: function () {
                        return {
                            photoType: photoType,
                            photo: ''
                        };
                    }
                }
            });

            modalInstance.modalTitle = 'View ' + photoType + ' photo';
            modalInstance.result.then(function (modalData) {
                $scope.user.picture = modalData.photo;
            });
        };

        $scope.selectedEmail = null;  // initialize our variable to null
        $scope.setClickedEmail = function(index) {  //function that sets the value of selectedRow to current index
            $scope.selectedEmail = index;
        };

        $scope.selectedPhone = null;  // initialize our variable to null
        $scope.setClickedPhone = function(index) {  //function that sets the value of selectedRow to current index
            $scope.selectedPhone = index;
        };
    }
]);

angular.module('users').controller('newmodal', ['$scope', '$uibModalInstance', 'modalData', function($scope, $uibModalInstance, modalData) {
    $scope.modalData = modalData;
    $scope.modalTitle = $uibModalInstance.modalTitle;

    $scope.ok = function () {
        $uibModalInstance.close($scope.modalData);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    $scope.formValid = false;
    
}]);
