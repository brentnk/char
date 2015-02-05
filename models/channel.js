var m = require('mongoose');

var chanSchema = m.Schema({
    server: {type: String, required: true },
    channelname: {type: String, required: true},
    messages: [{
        message: String,
        ts: Date,
        from: String
    }]
});

chanSchema.index({server:1, channelname: 1}, {unique: true});

chanSchema.statics.getAllChannels = function() {
    this.find()
}

chanSchema.statics.addMessage = function(server, channel, user, message, callback) {
    this.findOne({server:server, channelname: channel}, function(err,doc) {
        if (err) {
            return callback(err, null)
        };

        if(!doc) {
            var newdoc = new Channel({
                server: server,
                channelname: channel,
            });

            newdoc.messages.push({
                message: message,
                ts: Date.now(),
                from: user
            });

            newdoc.save(callback)
        }

        if(doc) {
            doc.messages.push({
                message: message,
                ts: Date.now(),
                from: user
            });

            doc.save(callback);
        };
    });
};

exports = module.exports = Channel = m.model('channel' ,chanSchema);
