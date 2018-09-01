// Import modules

const mongoose = require('mongoose');
const User = require('../models/User');
// const Calendar = require('../models/Calendar');
const fs = require('fs');
const path = require('path');
const ical = require('ical');
const download = require('download-to-file');
const generateCal = require('ical-generator');
const moment = require('moment-timezone');
const fetch = require('node-fetch');


exports.getUpdatedCalendar = async function() {
  let res = await fetch("https://www.asmilan.org/data/calendar/icalcache/feed_4961866F0A1F4803879866A56CA8EC4F_gmt.ics");
  return await res.text();
};

// function to create a new user

exports.addUser = async function(req, res, next) {
  const body = req.body;
  var user = await User.findOne({
    email: req.session.user.email
  });
  // Check if user exist, if they do, move on. Otherwise...
  if (user == null || user.length === 0) {
    // Do some cleanup with empty classes
    for (var i = 1; i <= 8; i++) {
      body.classes['p'+i].value.s2 = body.classes['p'+i].value.s2 == '' ? body.classes['p'+i].value.s1 : body.classes['p'+i].value.s2;
    }
    // Create the user and assign it to 'user'
    user = await new User({
        name: req.session.user.name,
        email: req.session.user.email,
        senior: body.senior,
        classes: body.classes
      })
      .save()
  } else {
    // Do some cleanup with empty classes
    for (var i = 1; i <= 8; i++) {
      body.classes['p'+i].value.s2 = body.classes['p'+i].value.s2 == '' ? body.classes['p'+i].value.s1 : body.classes['p'+i].value.s2;
    }
    // Update the user info
    user = await user.update({
      $set: {
        senior: body.senior,
        classes: body.classes
      }
    })
  }
  next();
};

async function setupCalendar(user) {
  const semesterEnd = '2019-01-25'; // The last day of semester 1
  const periods = {
    "A": [1, 2, 3, 4, 5],
    "B": [6, 7, 8, 1, 2],
    "C": [3, 4, 5, 6, 7],
    "D": [8, 1, 2, 3, 4],
    "E": [5, 6, 7, 8, 1],
    "F": [2, 3, 4, 5, 6],
    "G": [7, 8, 1, 2, 3],
    "H": [4, 5, 6, 7, 8]
  } // An object containing arrays of periods in each 'letter' day
  const timetable = {
    "P1": {
      start: "T09:00",
      end: "T10:05",
      end_hl: "T10:05"
    },
    "P2": {
      start: "T10:10",
      end: "T11:15",
      end_hl: "T11:15"
    },
    "P3": {
      start: "T11:20",
      end: "T12:25",
      end_hl: "T12:35"
    },
    "P4": {
      start: "T13:25",
      end: "T14:30",
      end_hl: "T14:30"
    },
    "P5": {
      start: "T14:35",
      end: "T15:40",
      end_hl: "T15:40"
    }
  } // An object the start and end of each period throughout the day

  // Create a JSON of events in the school's official calendar

  let JSONCal = {};

  await exports.getUpdatedCalendar().then(cal => {
    JSONCal=ical.parseICS(cal);
  })

  let calendar = {
    event: {
      name: [],
      startDate: [],
      endDate: []
    }
  }; // An object where only the events that end with '-Day' live in

  // One big loop where everything is done in. Probably not the best way but this will make due.
  let currentDPFlex = null;
  for (var event in JSONCal) { // For all events in the JSON (this is necessary as I don't know the names of the parent elements)
    const summary = JSONCal[event].summary; // The name of the event. ¯\_(ツ)_/¯
    var date = JSONCal[event].start; // The day, 'the day' starts ¯\_(ツ)_/¯
    date = moment(date.toISOString()); // Convert the date into a momentJS date
    date = date.format('YYYY-MM-DD'); // Extract the ISO YYYY-MM-DD for later
    isS2 = new Date(date).getTime() > new Date(semesterEnd).getTime(); // Check if the "current" date is after the end of s1

    if (summary.split('-')[1] === 'Day') { // If today is... a "day"
      // Create an event called...
      calendar.event.name.push(summary); // e.g. A-Day
      // ...starting at...
      calendar.event.startDate.push(moment.tz(date + "T07:30", 'Europe/Rome').utc()); // "Today", at 07:30
      // ...and ending at
      calendar.event.endDate.push(moment.tz(date + "T08:30", 'Europe/Rome').utc()); // "Today", at 08:30
      for (var i = 0; i < Object.keys(timetable).length; i++) { // For all the keys in time table. i.e. 5 times
        let currentClass = user.classes['p' + periods[summary.split('-')[0]][i]]; // e.g. classes['p'+periods['A'][0]] == Period 1

        if (user.senior && periods[summary.split('-')[0]][i] == 8) {
          currentDPFlex = currentDPFlex%8 + 1;
          if (user.classes['p' + currentDPFlex].hl) {
            currentClass = user.classes['p' + currentDPFlex];
          } else {
            currentClass.value = {
              s1: 'Independent Study',
              s2: 'Independent Study'
            }
          }
        }

        // TODO: DP Flex handling
        // TODO: Empty class handling
        // Create an event called...
        calendar.event.name.push(currentClass.value[!isS2 ? 's2' : 's1']);
        // ...starting at...
        calendar.event.startDate.push(moment.tz(date + timetable['P' + (i + 1)].start, 'Europe/Rome').utc()); // e.g. "Today", at 13:25
        // ...and ending at
        calendar.event.endDate.push(moment.tz(date + timetable['P' + (i + 1)][currentClass.hl ? 'end_hl' : 'end'], 'Europe/Rome').utc()); // e.g. "Today", at 14:30
      }
    }
  }
  return calendar; // Return the filled up calendar
}

exports.generateCalendar = async function(req, res, user) {
  // BUG: new user classes not created
  if (user && {}.toString.call(user) === '[object Function]') {
    user = await User.findOne({
      email: req.session.user.email
    });
  }

  const calendar = await setupCalendar(user);
  const cal = generateCal({
    name: 'Schedule',
    timezone: 'Europe/Rome',
  })
  .ttl(24*60*60)
  .url('parsuli.net/calendar/' + user._id)
  .prodId('//Parsuli//Schedule//EN')
  .domain('parsuli.net');
  for (var i = 0; i < calendar.event.name.length; i++) {
    let event = cal.createEvent({
      start: calendar.event.startDate[i].toDate(),
      end: calendar.event.endDate[i].toDate(),
      summary: calendar.event.name[i]
    })
    event.alarms([
      {type: "display", trigger: 600},
      {type: "display", trigger: 300}
    ]);
  }

  await user.update({
    $set: {
      calendar: cal.toString()
    }
  })

  res ? res.render('congrats', {req, user}) : null;
};

exports.fetchCalendar = async function(req, res) {
  const user = await User.findOne({
    '_id': req.params.id
  })
  res.set({
    'Content-Disposition': 'attachment; filename="calendar.ics"',
    'Content-Type': 'text/calendar'
  });
  res.send(user.calendar);
};
