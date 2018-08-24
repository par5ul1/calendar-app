
const util = require('util');
const express = require('express');
const ical = require('ical');
const JSONCal = ical.parseFile('./days.ics');
const calendar = {event: {name: [], date: []}};
for (var event in JSONCal) {
  calendar.event.name.push(JSONCal[event].summary);
  calendar.event.date.push(JSONCal[event].start);
}

// const config = require('./config');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const gcal = require('google-calendar');

/*
  ===========================================================================
            Setup express + passportjs server for authentication
  ===========================================================================
*/

const app = express();
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.use(cookieParser());
app.use(bodyParser());
app.use(session({
  secret: 'tomato soup'
}));
app.use(passport.initialize());
app.listen(8082);

passport.use(new GoogleStrategy({
    clientID: "214692766402-nce5umj78no25qgi6uut52eo2987e77c.apps.googleusercontent.com",
    clientSecret: "Jag6SR6V7xFImpPPpRel55AJ",
    callbackURL: "/auth/callback",
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    return done(null, profile);
  }
));

app.get('/', function (req, res) {
  res.render('homepage.pug', {
    user: {
      token: req.session.access_token || null
    },
    JSONCal
  })
});

app.get('/auth',
  passport.authenticate('google', {
    session: false
  }));

app.get('/auth/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  function(req, res) {
    req.session.access_token = req.user.accessToken;
    res.redirect('/');
  });

  app.get('/json', function (req, res) {
    res.json(calendar)
  })


/*
  ===========================================================================
                               Google Calendar
  ===========================================================================
*/

app.all('/list', function(req, res) {

  if (!req.session.access_token) return res.redirect('/auth');

  const accessToken = req.session.access_token;

  gcal(accessToken).calendarList.list(function(err, data) {
    if (err) return res.send(500, err);
    return res.send(data);
  });
});

app.all('/:calendarId', function(req, res) {

  if (!req.session.access_token) return res.redirect('/auth');

  const accessToken = req.session.access_token;
  const calendarId = req.params.calendarId;

  gcal(accessToken).events.list(calendarId, function(err, data) {
    if (err) return res.send(500, err);
    return res.send(data);
  });
});

app.all('/:calendarId/add', function(req, res) {

  if (!req.session.access_token) return res.redirect('/auth');

  const accessToken = req.session.access_token;
  const calendarId = req.params.calendarId;
  const text = req.query.text || 'Hello World';

  gcal(accessToken).events.quickAdd(calendarId, text, function(err, data) {
    if (err) return res.send(500, err);
    return res.redirect('/' + calendarId);
  });
});

app.all('/:calendarId/:eventId/remove', function(req, res) {

  if (!req.session.access_token) return res.redirect('/auth');

  const accessToken = req.session.access_token;
  const calendarId = req.params.calendarId;
  const eventId = req.params.eventId;

  gcal(accessToken).events.delete(calendarId, eventId, function(err, data) {
    if (err) return res.send(500, err);
    return res.redirect('/' + calendarId);
  });
});
