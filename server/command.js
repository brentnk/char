var _ = require('underscore');

var genericCommand = function() {
  var args = {};
  var required = [];

  this.SetRequired = function(args) {
    for(var i in args) {
      required.push(args[i]);
    }
  }

  this.SetArg = function(key, value) {
    if(key && value) {
      args[key] = value;
    }
  };

  this.Execute = function() {
    _.every(required, _.contains(args));
  }
}
