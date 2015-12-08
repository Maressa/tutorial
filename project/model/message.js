var mongoose = require('mongoose');
var messageSchema = new mongoose.Schema({
  name: String,
  text: String,
  date: {type: Date, default: Date.now}
});

mongoose.model('Message', messageSchema);
