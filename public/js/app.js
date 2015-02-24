'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('myApp', [
  'btford.socket-io',
  'ui.bootstrap',
  'myApp.controllers'
]).
factory('io', function (socketFactory) {
    return socketFactory();
}).
factory('_', function() {
	return window._;
});
//angular.module('myApp.controllers');
