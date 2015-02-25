var _irc      = require('irc');
var config    = require('../appconfig.js');
var ircconfig = config.irc;
var mongoose  = require('mongoose');
var Channel   = require('../models/channel');
var appConfig = require('../models/options');
// var ircUser   = require('../models/irc_user');
var parser    = require('./parser');
var options   = require('../models/options');
var https     = require('https');
var log       = require('../logger');

//var heapdump = require('heapdump');

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
        socket.emit('init');
        var channels = getChannels();
        for(var i in channels) {
            socket.emit('irc:newchannel', {channelname:channels[i]});
        }

        socket.on('cmdline', function(data){
            if(!data.raw || data.raw.length < 1) {
                log.info('Blank command received');
                return;
            }
            var cmd = parser(data.raw).data[0];
            log.info(cmd);
            if(!cmd || cmd.length < 1) {
                log.info('Invalid command');
                return;
            }

            log.info({raw: data}, 'socket.io cmdline received');

            switch(cmd[0]) {
                case 'top':
                    if(cmd[1] && !isNaN(parseInt(cmd[1],10)) && cmd[1] > 0) {
                        limit = Number(cmd[1]);
                    } else {
                        limit = 5;
                    }
                    log.info('limit:',limit);
                    var options = {
                        hostname: config.twitchApi.base,
                        headers: config.twitchApi.header,
                        path: '/kraken/streams',
                        method: 'GET'
                    };
                    var req = https.request(options , function(res) {
                        res.setEncoding('utf8');
                        var str = '';

                        res.on('data', function(chunk) {
                            str += chunk;
                        });

                        res.on('end', function(){
                            var streams = JSON.parse(str);
                            if('streams' in streams && streams['streams'].length > 0){
                                var top = streams['streams'].slice(0,limit);
                                for(var i = 0; i < top.length; i++) {
                                    if ('channel' in top[i]) {
                                        irc.join('#' + top[i].channel.display_name);
                                    }
                                }
                            }
                        });
                    })
                    req.setTimeout(1000*10);
                    req.end();
                    req.on('timeout', function() {
                        log.error('Twitch request has timed out...');
                    })
                    req.on('error', function(err) {
                        log.error({error:err}, 'Twitch request has encountered an error');
                    })
                    break;
                case 'join':
                    if (cmd[1]) {
                        var chans = cmd.slice(1);
                        for(var i in chans) {
                            if(chans[i][0] !== '#') {
                                chans[i] = '#' + chans[i];
                            }
                            irc.join(chans[i]);
                        }
                    }
                    break;
                case 'part' :
                    if (cmd[1]) {
                        log.info('Parting ', cmd[1]);
                        if(irc.chanData(cmd[1])) {
                            irc.part(cmd[1]);
                        } else {
                            log.info('Not connected to ', cmd[1]);
                        }
                        //socket.emit('irc:chandc', {channelname: cmd[1]});
                    } else {
                        var chans = getChannels();
                        log.info({channel_list: chans}, 'Parting all channels');
                        for(var chan in chans) {
                            if(irc.chanData(chans[chan])) {
                                irc.part(chans[chan]);
                            } else {
                                log.warn('Not connected to ', chans[chan]);
                            }
                        }
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
                    log.info('Command not recognized');
            }
        });
    });

    //
    // IRC Client Routes
    //

    irc.addListener('raw', function(raw) {
      log.info({irc_message: raw});
    });

    irc.addListener('registered', function() {
        getAutoJoins(function(err,res) {
            if(err) {return;}
            for(var a in res) {
                irc.join(res[a].value);
            }
        });

    });

    irc.addListener('message', function (sFrom, sTo, text, raw) {
      Channel.addMessage(server,sTo, sFrom, text);
      io.sockets.emit('irc:message',  { from: sFrom, channel: sTo, body: text, ts: Date.now() });
    });

    irc.addListener('part', function(channel, nick, reason, message) {
        if(ircconfig.nick == nick) {
            io.sockets.emit('irc:part', {channelname:channel});
        }
    });

    irc.addListener('join', function(channel, nick){
        channel = channel.toLowerCase();
        if(ircconfig.nick == nick){
            io.sockets.emit('irc:newchannel', {channelname:channel});
        }
    });
}
