'use strict';

/* Controllers */

function appController($scope, sSocket) {

    $scope.channels = new Object();
    $scope.messages = [];

    var messageLimitPerChannel = 50;
    var messageLimitGlobal = 40;
    $scope.messsgeLimitView = 75;

    //
    // sSocket listeners
    //

    sSocket.on('init', function(data){
        console.log('init -> []');
        $scope.channels = new Object();
        $scope.messages = [];
    });

    sSocket.on('irc:message', function(msg){
        $scope.messages.unshift(msg);
        $scope.channels[msg.channel].msgcount += 1;
        while ($scope.messages.length > messageLimitGlobal) {
            var temp = $scope.messages.pop();
            $scope.channels[temp.channel].msgcount -= 1;
        }
        //d3.selectAll('.ircmessage').style('color', function(){
            //return 'hsl(' + (Math.random() * 75 + 160) + ',100%,80%)';
        //});
        d3.select('.iograph').transition()
            .style('background', 'hsl(' + (Math.random() * 95 + 160) + ',100%,80%)');
    });

    sSocket.on('irc:newchannel', function(data) {
        console.log('irc:newchannel -> ', data.channelname);
        if (!(data.channelname in $scope.channels)) {
            $scope.channels[data.channelname] = new Object();
            $scope.channels[data.channelname].msgcount = 0;
        }
        console.log(Object.keys($scope.channels));
    });

    sSocket.on('irc:part', function(data) {
        console.log('irc:part -> ', data.channelname);
        delete $scope.channels[data.channelname];
    });

    //
    // Scope published methods
    //

    $scope.processCmd = function() {
        console.log('processCmd from browser: ', $scope.cmdl);
        console.log(sSocket);
        sSocket.emit('cmdline', {raw: $scope.cmdl});
        $scope.cmdl = '';
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
