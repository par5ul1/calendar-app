const mongoose = require('mongoose');

const Calendar = new mongoose.Schema({
  calendar: String
})

module.exports = mongoose.model('Calendar', Calendar);
