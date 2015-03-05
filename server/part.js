var log = require('../logger');

var part = function() {
  trigger = 'part';
  dep = ['ircClient'];

  this.trigger = function(key) { return key === trigger; };

  this.fire = function(deps, args) {
    if (!args.chans) {
        log.info('Parting ', cmd[1]);
        if(irc.chanData(cmd[1])) {
            irc.part(cmd[1]);
        } else {
            log.info('Not connected to ', cmd[1]);
        }
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
  }
};
