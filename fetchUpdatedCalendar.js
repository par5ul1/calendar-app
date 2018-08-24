const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });
const User = require('./models/User');
const calendarController = require('./controllers/calendarController');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true
});

fetch("https://www.asmilan.org/data/calendar/icalcache/feed_4961866F0A1F4803879866A56CA8EC4F_gmt.ics")
  .then(res => res.text())
  .then(async calendar => {
    updateAllUsers(calendar)
  })

async function updateAllUsers(original_calendar) {

  users = await User.find({});

  await users.forEach(function (user) {
    // Do sth
  })

  mongoose.connection.close();

}
