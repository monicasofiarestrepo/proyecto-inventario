var app = angular.module('app', []);

app.controller('ContectWebPage', ['$scope', '$http', '$timeout', SerenityController]);
function SerenityController($scope, $http, $timeout, lenguaje) {
        $http.get("Data/Contact.json")
        .success(function (response) {
            $scope.content = response;
    });
}