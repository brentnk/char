var pa = require('babyparse');

var parser = function(str) {
    var res = pa.parse(str, {delimiter:' '});
    return res;
};

exports = module.exports = parser;
