var _irc = require('irc');
var config = require('../appconfig');
var ircconfig = config.irc;
var mongoose = require('mongoose');
var Channel = require('../models/channel');


var defcb = function(err, user, numberAffected) {
    if (err) {
        console.log('There was an error: ', err);
        return;
    };

    //console.log('Message was added..');
};

var parseRaw = function(str) {
    str = str.trim();
    if (str.length < 1) return ''; // The cake is a lie
    return str.split(' ');
}

module.exports = function(io) {
    server = ircconfig.server;
    var irc = new _irc.Client(ircconfig.server, ircconfig.nick, ircconfig.options);

    var getChannels = function() {
        return Object.keys(irc.chans)
    };

    mongoose.connect(config.db.connectionString);

    //
    // Socket IO routes
    //

    io.sockets.on('connection',function(socket){
        var channels = getChannels();
        for(var i = 0; i<channels.length; i++) {
            socket.emit('irc:newchannel', {channelname:channels[i]});
        }

        socket.on('cmdline', function(data){
            if(!data.raw || data.raw.length < 1) {
                console.log('Blank command received');
                return;
            }
            var cmd = parseRaw(data.raw);
            if(!cmd || cmd.length < 1) {
                console.log('Invalid command');
                return;
            }

            switch(cmd[0]) {
                case 'join':
                    if (cmd[1]) {
                    console.log('Joining ', cmd.slice(1,cmd.length).join(' '));
                    irc.join(cmd.slice(1,cmd.length).join(' '));
                    }
                    break;
                case 'part' :
                    if (cmd[1]) {
                    console.log('Parting ', cmd[1]);
                    if(irc.chanData(cmd[1])) {
                        irc.part(cmd[1]);
                    } else {
                        console.log('Not connected to ', cmd[1]);
                    }
                    socket.emit('irc:chandc', {channelname: cmd[1]});
                    }
                    break;
                case 'clear':
                    socket.emit('irc:clearchat');
                    break;
                default:
                    console.log('Command not recognized');
            }
        });
    });

    //
    // IRC Client Routes
    //

    //irc.addListener('raw', function(msg) {
    //console.log(msg);
    //})

    irc.addListener('message', function (sFrom, sTo, text, raw) {
        Channel.addMessage(server,sTo, sFrom, text, defcb);
        io.sockets.emit('irc:message',  { from: sFrom, channel: sTo, body: text });
    });

    irc.addListener('error', function(message){
        console.log('There was an error: ' + message);
    });

    irc.addListener('part', function(channel, nick, reason, message) {
        //console.log(channel, nick);
        if(ircconfig.name == nick) {
            console.log('I left ',channel);
            io.sockets.emit('irc:part', {channelname:channel});
        }
    });

    irc.addListener('join', function(channel, nick,message){
        //console.log(channel,nick);
        if(ircconfig.nick == nick){
            console.log('I joined ',channel);
            io.sockets.emit('irc:newchannel', {channelname:channel});
        }
    });
}
