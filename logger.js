var logger = require('bunyan');
var log    = logger.createLogger(
  {
    name:'charBot',
    streams: [
      {
        type: 'rotating-file',
        path: 'c:/var/logs/charbot.log',
        period: '3d',
        count: 10
      }
      // ,
      // {
      //   stream: process.stderr
      // }
    ]
  });

log.on('error', function(err,stream) {
  console.log(err);
});

exports = module.exports = log;
