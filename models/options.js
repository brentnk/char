var m = require('mongoose');

var appConfigSchema = new m.Schema({
    key: String,
    value: {}
});

exports = module.exports = m.model('appconfig', appConfigSchema);
