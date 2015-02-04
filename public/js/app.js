'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('myApp', [
  'btford.socket-io',
  'ui.bootstrap'
]).
factory('sSocket', function (socketFactory) {
    return socketFactory();
});
