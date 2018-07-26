const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'variables.env' });
const router = require('./routes/index');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/', router);
app.use(express.static(path.join(__dirname+'/public')));
app.use('/calendars', express.static(path.join(__dirname+'/calendars')));

mongoose.connect("mongodb://r00t:alp1ne@ds111299.mlab.com:11299/schedule-to-cal", {
  useNewUrlParser: true
});

var port_number = process.env.PORT || 3000;
app.listen(port_number, function () {
  console.log('Website is up and running');
});
