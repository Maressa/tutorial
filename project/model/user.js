var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  created: {type: Date, default: Date.now}
});

mongoose.model('User', userSchema);
