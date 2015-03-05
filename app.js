
/**
 * Module dependencies
 */

var express      = require('express'),
  routes         = require('./routes'),
  api            = require('./routes/api'),
  http           = require('http'),
  path           = require('path'),
  morgan         = require('morgan'),
  methodOverride = require('method-override'),
  staticServe    = require('serve-static'),
  bodyParser     = require('body-parser'),
  errorhandler   = require('errorhandler');

var app    = module.exports = express();
var server = require('http').createServer(app);
var io     = require('socket.io').listen(server);
var irc    = require('irc');

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 7777);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(staticServe(path.join(__dirname, 'public')));

// development only
if (app.get('env') === 'development') {
  app.use(errorhandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
};

//console.log(routes);

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// IRC Client and socket handler
var client = require('./server/ircclient')(io);

// Start server
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
