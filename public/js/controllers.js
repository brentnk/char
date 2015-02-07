'use strict';

/* Controllers */

function appController($scope, sSocket) {

    $scope.channels = new Object();
    messages = [];
    $scope.messages = function(limit) {
        return messages.slice(-50);
    }

    var messageLimitPerChannel = 50;
    var messageLimitGlobal = 1500;
    var messsgeLimitView = 75;

    //
    // sSocket listeners
    //

    sSocket.on('init', function(data){
        //$scope.channels.concat(data.channels);
    });

    sSocket.on('irc:message', function(msg){
        $scope.messages.push(msg);
        $scope.channels[msg.channel].msgcount += 1;
        while ($scope.messages.length > messageLimitGlobal) {
            var temp = $scope.messages.shift();
            $scope.channels[temp.channel].msgcount -= 1;
        }
        d3.selectAll('.ircmessage').style('color', function(){
            return 'hsl(' + (Math.random() * 25 + 160) + ',100%,80%)';
        });
    });

    sSocket.on('irc:newchannel', function(data) {
        console.log('irc:newchannel -> ', data.channelname);
        if (!(data.channelname in $scope.channels)) {
            $scope.channels[data.channelname] = new Object();
            $scope.channels[data.channelname].msgcount = 0;
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
