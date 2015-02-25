var m = require('mongoose');
var events = require('events');
var emitter = new events.EventEmitter();

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
    this.find();
}

chanSchema.statics.addMessage = function(server, channel, user, message) {
  this.findOneAndUpdate(
    {server:server, channelname:channel},
    {
      $push: {
        messages: {
          message:message,
          ts: Date.now(),
          from: user
          }
      }
    },
    {upsert:true},
    function(err,doc,numAffected) {
      if(err) {
        emitter.emit('addMesssage::SaveError');
        return;
      }
      if (numAffected < 1) {
        emitter.emit('addMessage::SaveError::NoRowsAffected');
      } else {
        emitter.emit('addMessage::DocumentSaved');
      }
      return;
    });
    // this.findOne({server:server, channelname: channel}, function(err,doc) {
    //     if (err) {
    //         console.error('There was an error saving');
    //         emitter.emit('addMessage::SaveError');
    //     };
    //
    //     if(!doc) {
    //         var newdoc = new Channel({
    //             server: server,
    //             channelname: channel,
    //         });
    //
    //         newdoc.messages.push({
    //             message: message,
    //             ts: Date.now(),
    //             from: user
    //         });
    //
    //         console.log('Saving doc in new channel');
    //         newdoc.save( function (err, unit, numAffected)  {
    //             if(err) {
    //                 emitter.emit('addMessage::SaveError')
    //                 return;
    //             }
    //
    //             if (numAffected < 1) {
    //                 emitter.emit('addMessage::SaveError::NoRowsAffected');
    //             } else {
    //                 emitter.emit('addMessage::DocumentSaved');
    //             }
    //         });
    //     } else {
    //         doc.messages.push({
    //             message: message,
    //             ts: Date.now(),
    //             from: user
    //         });
    //
    //         //console.log('Saving message to mongo.');
    //         doc.save(function (err, unit, numAffected)  {
    //             if(err) {
    //                 emitter.emit('addMessage::SaveError')
    //                 return;
    //             }
    //
    //             if (numAffected < 1) {
    //                 emitter.emit('addMessage::SaveError::NoRowsAffected');
    //             } else {
    //                 emitter.emit('addMessage::DocumentSaved');
    //             }
    //         });
    //     };
    // });
};

exports = module.exports = Channel = m.model('channel' ,chanSchema);
