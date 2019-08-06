// User class

const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: String,
  email: String,
  senior: {
    type: Boolean,
    default: false
  },
  classes: Object,
  original_calendar: String,
  calendar: String
})

module.exports = mongoose.model('User', User);
