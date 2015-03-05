var logger = require('bunyan');
// var es     = require('bunyan-elasticsearch');
// var esStream = new es({
//   indexPattern: '[logstash-]YYYY.MM.DD',
//   type: 'logs',
//   host: '127.0.0.1:9300'
// });

var log    = logger.createLogger(
  {
    name:'charBot',
    streams: [
      {
        type: 'rotating-file',
        path: './charbot.log',
        period: '3d',
        count: 10
      }
    ]
  });

log.on('error', function(err,stream) {
  console.log(err);
});

exports = module.exports = log;
