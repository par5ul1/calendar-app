const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });
const User = require('./models/User');
const calendarController = require('./controllers/calendarController');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true
});

User.find({}).then(users => {
  users.forEach(async user => {
    console.log('Aww Shieet');
    await calendarController.generateCalendar(null, null, user)
  })
})

setTimeout(() => {
  mongoose.connection.close()
}, 120000)
