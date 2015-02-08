var m = require('mongoose');

var appConfigSchema = new m.Schema({
    key: String,
    value: {}
});

appConfigSchema.statics.rm = function(key, val) {
    console.log('Removing: ',key,val);
    Config.remove({key:key, value:val}, function(err) {
        if(err) { console.log(err); }
    });
}

appConfigSchema.statics.add = function(key, val) {
    var temp = new Config({
        key: key,
        value: val
    });
    temp.save();
}

exports = module.exports = Config = m.model('appconfig', appConfigSchema);
