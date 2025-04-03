const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String },
  interests: { type: [String], default: [] },
  location: { type: String, default: "" },  
  password: String,
  notificationPreference: String,
});

module.exports = mongoose.model('User', userSchema);