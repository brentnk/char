'use strict';

/* Controllers */

function appController($scope, sSocket) {

    $scope.channels = new Object();

    var messageLimitPerChannel = 50;
    var messageLimitGlobal = 10000;

    //
    // sSocket listeners
    //

    sSocket.on('init', function(data){
        //$scope.channels.concat(data.channels);
    });

    sSocket.on('irc:message', function(msg){
        $scope.channels[msg.channel].messages.push({from: msg.from, msg: msg.body});
    });

    sSocket.on('irc:newchannel', function(data) {
        console.log('irc:newchannel -> ', data.channelname);
        if (!(data.channelname in $scope.channels)) {
            $scope.channels[data.channelname] = new Object();
            $scope.channels[data.channelname].messages = [];
        }
        console.log(Object.keys($scope.channels));
    });

    sSocket.on('irc:chandc', function(data) {
        console.log('irc:chandc -> ', data.channelname);
        delete $scope.channels[data.channelname];
    });

    //
    // Scope published methods
    //


    $scope.processCmd = function() {
        console.log('processCmd from browser: ', $scope.cmdl);
        console.log(sSocket);
        sSocket.emit('cmdline', {raw: $scope.cmdl});
    }

    $scope.chatFilter = function(filter) {
        $scope.chatfilter = filter;
    }

    $scope.RequestJoinChannel = function (name) {
        sSocket.emit('requestChannelJoin', {channelname:name});
    };
    $scope.RequestPartChannel = function (name) {
        sSocket.emit('requestChannelPart', {channelname:name});
    };

}
