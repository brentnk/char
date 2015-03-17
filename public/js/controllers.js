'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('appController',['$scope','io','_',function($scope,io,_) {

    $scope.test = ['bill','john','hank'];
    var commandHistory = [];
    $scope.channels = new Object();
    $scope.messages = function() {
        return _.chain($scope.channels)
            .map(function(x){
                return x.messages;
            })
            .flatten()
            .sortBy(function(a){ return a.ts })
            .value();
    };

    var historyLimit = 70;
    var messageLimitPerChannel = 50;
    var messageLimitGlobal = 40;
    $scope.messsgeLimitView = 75;

    //
    // io listeners
    //

    var initChart = function() {
      var chartArea = d3.select('.iograph');
      var svg = d3.select('.iograph').append('svg')
        .attr('height', '100%')
        .attr('width', '100%');
    }

    io.on('init', function(data){
        console.log('init -> []');
        $scope.channels = new Object();

        initChart();
    });

    io.on('irc:message', function(msg){
        $scope.channels[msg.channel].messages.unshift(msg);
        while ($scope.channels[msg.channel].messages.length > messageLimitPerChannel) {
            $scope.channels[msg.channel].messages.pop();
        }
        //d3.selectAll('.ircmessage').style('color', function(){
            //return 'hsl(' + (Math.random() * 75 + 160) + ',100%,80%)';
        //});
        d3.select('.iograph').transition()
            .style('background', 'hsl(' + (Math.random() * 95 + 160) + ',100%,80%)');
    });

    io.on('irc:newchannel', function(data) {
        console.log('irc:newchannel -> ', data.channelname);
        if (!(data.channelname in $scope.channels)) {
            $scope.channels[data.channelname] = new Object();
            $scope.channels[data.channelname].messages = [];
        }
        console.log(Object.keys($scope.channels));
    });

    io.on('irc:part', function(data) {
        console.log('irc:part -> ', data.channelname);
        delete $scope.channels[data.channelname];
    });

    //
    // Scope published methods
    //

    $scope.processCmd = function() {
        console.log('processCmd from browser: ', $scope.cmdl);
        io.emit('cmdline', {raw: $scope.cmdl});
        commandHistory.push($scope.cmdl);
        $scope.cmdl = '';
    }

    $scope.toggleChannelMessages = function(e,key) {
      // TODO
    }

    $scope.chatFilter = function(filter) {
        $scope.chatfilter = filter;
    }

    $scope.RequestJoinChannel = function (name) {
        io.emit('requestChannelJoin', {channelname:name});
    };
    $scope.RequestPartChannel = function (name) {
        io.emit('requestChannelPart', {channelname:name});
    };

}]);
