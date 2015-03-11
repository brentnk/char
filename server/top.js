var log = require('../logger');

var topExec = function() {
  twitch.request({},function(err,res) {
    if(err) {
      log.err(err);
    } else if(res) {
      if('streams' in streams && streams['streams'].length > 0){
        var top = streams['streams'].slice(0,limit);
        for(var i = 0; i < top.length; i++) {
          if ('channel' in top[i]) {
            deps[ircClient].join('#' + top[i].channel.display_name);
          }
        }
      }
    } else {
      log.error('Invalid response from twitch.request');
    }
  });
};

com.defineCommnad(
  'top',
  ['irc'],
  {limit: {required: true, numeric: true, gt: 0, default: 3}}
)

var command = function(trigger, definitions, dependencies) {
  this.trigger = trigger;
  this.dependencies = dependencies || []; // array of strings
  this.definition = definitions;

  if(!(typeof(args) === 'object')) {
    log.error('Args must be an object');
    return {error:true, message: 'Args mus be an object'};
  }
}

Command.prototype.run = function(args) {
  console.out(args);
}

Command.prototype.setArgumentDefinition = function(def) {
  argDef = def;
}

Command.prototype.validateArgs = function() {
    for(var a in argDef) {
      var def = argDef[a];
      //existence check
      if(!(a in args) && def.required) {
        return false;
      }

      // numeric check
      if(def.numeric) {
        temp = parseInt(args[a], 10);
        if(isNan(temp)) {
          return false;
        } else {
          args[a] = temp;
        }
      }

      // greater than check
      if(def.gt && args[a] <= def.gt) {
        return false;
      }

      return true;
    }
  }

Command.prototype.help = function() {
  return 'default help';
};

Command.prototype.trigger = function(key) {
  return key === trigger;
};

Command.prototype.execute = function() {
  if(this.validateArgs()) {
    this.run(args);
  }
};

module.exports = exports = top;
