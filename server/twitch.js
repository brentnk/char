var https  = require('https');
var config = require('../appconfig');
var _      = require('underscore');

var twitch = function(){
  var options = {
    hostname: config.twitchApi.base,
    headers: config.twitchApi.header,
    path: '/kraken/streams',
    method: 'GET'
  };

  this.request = function(option, cb) {
    _.extend(options, option);

    https.request(options,function(res) {
      res.setEncoding('utf8');
      var str = '';

      res.on('data', function(chunk) {
        str += chunk;
      });

      res.on('end', function(){
        try {
          var data = JSON.parse(str);
          cb(null, data);
        } catch (err) {
          cb(err, null);
        }
      }
    }
  }

  var req = ;
  req.setTimeout(1000*10);
  req.end();
  req.on('timeout', function() {
    log.error('Twitch request has timed out...');
  })
  req.on('error', function(err) {
    log.error({error:err}, 'Twitch request has encountered an error');
    cb(err, null);
  })
};
