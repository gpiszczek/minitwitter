var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
  username: { type: String, required: true },
  body:     { type: String, required: true },
  date:     { type: Date,   required: true, default: Date.now }
});

module.exports = mongoose.model('posts', Post);
