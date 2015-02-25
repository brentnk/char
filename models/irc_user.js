var m = require('mongoose');

var ircUserSchema = m.schema({
  name: {required: true, unique: true},
  seen_in: [{channel: String, mode:String, time: Date}]
});

exports = module.exports = IrcUser = m.model('ircUser', ircUserSchema);
