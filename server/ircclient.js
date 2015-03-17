var _irc      = require('irc');
var config    = require('../appconfig.js');
var ircconfig = config.irc;
var mongoose  = require('mongoose');
var Channel   = require('../models/channel');
var appConfig = require('../models/options');
var options   = require('../models/options');
var https     = require('https');
var log       = require('../logger');
var elastic   = require('elasticsearch');

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

    // mongoose.connect(config.db.connectionString);

    var es = elastic.Client({
      requestTimeout:3000
    });

    es.indices.create({
      index: 'irc',
      body : {
        mappings: {
          ircmsg: {
            properties : {
              '@timestamp' : {
                type: 'date',
                enabled: true,
                format: "YYYY-MM-dd'T'HH:mm:ss.SSS'Z'",
                default: Date.now()
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
        // Initial connection sends all channels to the client.
        socket.emit('irc:newchannel', {channelname: '<<blank>>'});
        for(var i in channels) {
            socket.emit('irc:newchannel', {channelname:channels[i]});
        };

        socket.on('irc:join', function(data) {
          if(!data || !('channel' in data)) {
            log.error('irc:join channel data missing.');
          } else {
            if(typeof(data.channel) === 'string') {
              irc.join(data.channel);
            }
          }
        });

        socket.on('irc:part', function(data) {
          if(!data || !('channel' in data)) {
            log.error('irc:part channel data missing.');
          } else {
            if(typeof(data.channel) === 'string') {
              irc.part(data.channel);
            }
          }
        });



    });

    //
    // IRC Client Routes
    //

    // irc.addListener('raw', function(raw) {
      //log.info({irc_message: raw});
      //raw['@timestamp'] = Date.now();
      // esClient.create({
      //   index: 'irc',
      //   type: 'ircmsg',
      //   body: raw
      // }, function(err,res) {
      //   if(err) {
      //     log.error(err);
      //   } else {
      //     log.info(res);
      //   }
      // });
    // });

    irc.addListener('registered', function() {
        getAutoJoins(function(err,res) {
            if(err) {return;}
            for(var a in res) {
                irc.join(res[a].value);
            }
        });

    });

    irc.addListener('message', function (sFrom, sTo, text, raw) {
      // Channel.addMessage(server,sTo, sFrom, text);
      es.create({
        index: 'irc',
        type : 'ircmsg',
        body : {
          from: sFrom,
          to  : sTo,
          body: text,
          raw : raw,
          '@timestamp'  : Date.now()
        }
      });
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
