var _irc      = require('irc');
var config    = require('../appconfig.js');
var ircconfig = config.irc;
var mongoose  = require('mongoose');
var Channel   = require('../models/channel');
var appConfig = require('../models/options');
var parser    = require('./parser');
var options   = require('../models/options');
var https     = require('https');

var heapdump = require('heapdump');

var defcb = function(err, user, numberAffected) {
    if (err) {
        console.log('There was an error: ', err);
        return;
    };

    console.log('Message was added... rows affected ', numberAffected);
    return;
};

module.exports = function(io) {
    server = ircconfig.server;
    var irc = new _irc.Client(ircconfig.server, ircconfig.nick, ircconfig.options);

    var getChannels = function() {
        return Object.keys(irc.chans)
    };
    var getAutoJoins = function(callback) {
        options.find({key:'autojoin'}).select('value').exec(callback);
    }

    mongoose.connect(config.db.connectionString);


    if (config.heapdump) {

        setInterval(function() {
            heapdump.writeSnapshot();
        }, 3000);
    }
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
            var cmd = parser(data.raw).data[0];
            console.log(cmd);
            if(!cmd || cmd.length < 1) {
                console.log('Invalid command');
                return;
            }

            switch(cmd[0]) {
                case 'top5':
                    https.request({
                    hostname: config.twitchApi.base,
                    headers: config.twitchApi.header,
                    path: '/kraken/streams',
                    method: 'GET'
                }, function(res) {
                    res.setEncoding('utf8');
                    var str = '';
                    res.on('data', function(chunk) {
                        str += chunk;
                    });
                    res.on('end', function(){
                        console.log('END of read');
                        var streams = JSON.parse(str);
                        if('steams' in streams && stream['streams'].length > 0){
                            for(var strim in streams['streams'].slice(0,5)) {
                                if ('name' in strim) {
                                    irc.join(strim.name);
                                }
                            }
                        }
                    })
                }).end();
                break;
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
                case 'autojoin':
                    if (cmd[1] && cmd[1] == '-') {
                    if(cmd[2]) {
                        options.rm('autojoin', cmd[2]);
                    }
                } else if (cmd[1] && cmd[1] == '+') {
                    if(cmd[2]) {
                        options.add('autojoin', cmd[2]);
                    }
                } else if (cmd[1] && cmd[1] == '^') {
                    if(cmd[2]) {
                        options.add(cmd[2]);
                    }
                }
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

    irc.addListener('registered', function() {
        getAutoJoins(function(err,res) {
            if(err) {return;}
            //console.log(res,res.length);
            for(var a in res) {
                console.log(res[a].value);
                irc.join(res[a].value);
            }
        });

    })

    irc.addListener('message', function (sFrom, sTo, text, raw) {
        Channel.addMessage(server,sTo, sFrom, text);
        io.sockets.emit('irc:message',  { from: sFrom, channel: sTo, body: text });
    });

    irc.addListener('error', function(message){
        console.log('There was an error: ' + message);
    });

    irc.addListener('part', function(channel, nick, reason, message) {
        if(ircconfig.name == nick) {
            console.log('I left ',channel);
            io.sockets.emit('irc:part', {channelname:channel});
        }
    });

    irc.addListener('join', function(channel, nick,message){
        if(ircconfig.nick == nick){
            console.log('I joined ',channel);
            io.sockets.emit('irc:newchannel', {channelname:channel});
        }
    });
}
