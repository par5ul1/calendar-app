const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const passport = require('passport');
const google = require('passport-google-oauth').OAuth2Strategy;

// Create Google Strategy
passport.use(new google({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/callback",
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/userinfo.profile']
  },
  function(accessToken, refreshToken, profile, done) {
    profile.token = accessToken;
    return done(null, profile);
  }
));

//Load homepage
router.get('/', function (req, res) {
  res.render('homepage', {req})
})

//Load finished screen post-calendar creation
router.get('/congrats', function (req, res) {
  res.render('congrats', {req})
})

//Authenticate user via Passport
router.get('/auth', passport.authenticate('google', { session: false }));

router.get('/auth/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/fail' }),
  function(req, res) {
    req.session.user = {
      name: req.user.displayName,
      token: req.user.token,
      email: req.user.emails[0].value
    }
    res.redirect('/');
});

router.get('/calendar/:id', calendarController.fetchCalendar)

//Create a user and add to database
router.post('/', calendarController.addUser, calendarController.generateCalendar)

module.exports = router;
