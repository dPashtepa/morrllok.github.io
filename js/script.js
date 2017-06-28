var app = angular.module('myApp', ['ngAutocomplete', 'ngRoute'])

.config(function ($routeProvider) {

    $routeProvider
        .when('/stepOne', {
            templateUrl: 'views/one.html',
            controller: 'firstCtrl'
        })
        .when('/stepTwo', {

            templateUrl: 'views/two.html',
            controller: 'secondCtrl'
        })
        .when('/stepThree', {

            templateUrl: 'views/three.html',
            controller: 'thirdCtrl'
        })
        .otherwise({
            redirectTo: '/stepOne'
        })
})

.controller('firstCtrl', ['$scope', 'myService', function ($scope, myService) {
    if(myService.checkPrefill()){
        $scope.form = myService.getData();
        $scope.filledForm = function(){
            var len = Object.keys($scope.form).length;
            return len !== 6;
        }
    } else {
        myService.getTransactions()
            .then(function(data){
                $scope.form = data;
            })
            .then(function(){
                $scope.filledForm = function(){
                    var len = Object.keys($scope.form).length;
                    return len !== 6;
                }
            })
    }


    $scope.check = function(obj) {
        return Object.keys(obj).length
    }

    $scope.addData = function() {
        myService.setData($scope.form);
    }




}])

.controller('secondCtrl', ['$scope', 'myService', function ($scope, myService) {

    myService.checkPrefill() ? $scope.form = myService.getData(): myService.getTransactions().then(function(data){
        $scope.form = data;
    })

    $scope.check = function(obj) {
        return Object.keys(obj).length
    }

    $scope.checkCode = function(code) {
        var five = parseInt(code.toString().split('').slice(0,5).join('')),
            startDate = new Date(1900, 0, 0);
        startDate.setDate(startDate.getDate()+five);
        var yearsApart = new Date(new Date - startDate).getFullYear()-1970;
        return yearsApart >= 21;
    }

    $scope.result = '';
    $scope.options = null;
    $scope.details = '';

    $scope.addData = function() {
        myService.setData($scope.form);
    }

}])

.controller('thirdCtrl', ['$scope', 'myService', '$http', function ($scope, myService, $http) {

    if(myService.checkPrefill()){
        $scope.form = myService.getData();
        $scope.checkResults = function(obj) {
            return Object.keys(obj).length < 5;
        }
        if($scope.checkResults($scope.form)) window.location.href = '#/stepOne';
    } else {
        myService.getTransactions()
            .then(function(data){
                $scope.form = data;
            })
            .then(function(){
                $scope.checkResults = function(obj) {
                    return Object.keys(obj).length < 5;
                }
        if($scope.checkResults($scope.form)) window.location.href = '#/stepOne';
        })
    }

    $scope.submitForm = function () {
            var data = $scope.form;
            var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }

            $http.post('/ServerRequest/PostDataResponse', data, config)
            .success(function (data, status, headers, config) {
                myService.resetData();
                alert('Форма отправленна!');
            })
            .error(function (data, status, header, config) {
                alert('Форма не отправленна: ' + status);
            });
        
    };


}])

.factory('myService', function ($http) {
    var formData = {},
    preFilled = false;
    return {
        getData: function () {
            return formData;
        },
        setData: function (newFormData) {
            formData = newFormData
        },
        resetData: function () {
            formData = {};
        },
        preFill: function() {
            $http.get('form.json').success(function(data) {
                formData = data;
            });    
        },
        getTransactions: function(){
           //is a request needed?
           return $http.get("form_new.json").then(function(result){
               formData = result.data;
               preFilled = true;
               return formData;
           });
        },
        checkPrefill: function() {
            return preFilled;
        }
    };
});

