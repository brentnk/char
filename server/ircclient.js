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
var elastic   = require('elasticsearch');
var twitch    = require('./twitch');

//var heapdump = require('heapdump');

// Gets the top channels from twitch api and joins them.


module.exports = function(io) {
    var components = {};

    server = ircconfig.server;
    var irc = new _irc.Client(ircconfig.server, ircconfig.nick, ircconfig.options);
    var esClient = elastic.Client({
      requestTimeout:3000
    });

    components.ircClient = irc;
    components.esClient  = esclient;

    var getChannels = function() {
        return Object.keys(irc.chans)
    };
    var getAutoJoins = function(callback) {
        options.find({key:'autojoin'}).select('value').exec(callback);
    }

    mongoose.connect(config.db.connectionString);


    var commands = [];
    commands.push(top);


    esClient.indices.create({
      index: 'irc',
      body : {
        mappings: {
          ircmsg: {
            _timestamp: {
              enabled: true,
              store: true,
              format: "YYYY-MM-dd'T'HH:mm:ss.SSS'Z'"
            },
            properties: {
              '@timestamp': {
                type: 'date',
                enabled: true,
                store: true,
                format: "YYYY-MM-dd'T'HH:mm:ss.SSS'Z'"
              }
            }
          }
        }
      }
    });

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
      raw['@timestamp'] = Date.now();

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
      esClient.create({
        index: 'irc',
        type: 'ircmsg',
        body: {
          '@timestamp': Date.now(),
          from: sFrom,
          to: sTo,
          text: text
        }
      }, function(err,res) {
        if(err) {
          log.error(err);
        } else {
          log.info(res);
        }
      });
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
