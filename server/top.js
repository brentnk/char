var log = require('../logger');

var top = function(deps, args) {
  trigger = 'top';
  dep = ['ircClient'];

  argDef = {
    limit: {required: true, numeric: true, gt: 0, default: 3}
  };

  if(!(typeof(args) === 'object')) {
    log.error('Args must be an object');
    return {error:true, message: 'Args mus be an object'};
  }

  var validateArgs = function() {
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

  this.trigger = function(key) { return key === trigger; };

  this.fire = function() {
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
    })
  };
};
