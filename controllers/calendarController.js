// Import modules

const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const ical = require('ical');
const download = require('download-to-file');
const generateCal = require('ical-generator');
const moment = require('moment-timezone');


// function to create a new user

exports.addUser = async function(req, res, next) {
  const body = req.body;
  var user = await User.findOne({
    email: req.session.user.email
  });
  // Check if user exist, if they do, move on. Otherwise...
  if (user == null || user.length === 0) {
    // Create the user and assign it to 'user'
    user = await new User({
        name: req.session.user.name,
        email: req.session.user.email,
        senior: body.senior,
        classes: body.classes
      })
      .save()
  }
  next();
};

function setupCalendar(classes) {
  // TODO: Add a service to grab updated calendar every time
  const semesterEnd = '2018-01-25'; // The last day of semester 1 // TEMP: Change yr to 2019
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
  const JSONCal = ical.parseFile('./calendar.ics');
  const calendar = {
    event: {
      name: [],
      startDate: [],
      endDate: []
    }
  }; // An object where only the events that end with '-Day' live in

  // One big loop where everything is done in. Probably not the best way but this will make due.
  for (var event in JSONCal) { // For all events in the JSON (this is necessary as I don't know the names of the parent elements)
    const summary = JSONCal[event].summary; // The name of the event. ¯\_(ツ)_/¯
    var date = JSONCal[event].start; // The day, 'the day' starts ¯\_(ツ)_/¯
    date = moment(date.toISOString()); // Convert the date into a momentJS date
    date = date.format('YYYY-MM-DD'); // Extract the ISO YYYY-MM-DD for later
    isS2 = new Date(date).getTime() > new Date(semesterEnd).getTime(); // Check if the "current" date is after the end of s1

    if (summary.split('-')[1] === 'Day') { // If today is... a day
      // Create an event called...
      calendar.event.name.push(summary); // e.g. A-Day
      // ...starting at...
      calendar.event.startDate.push(moment.tz(date+"T07:30", 'Europe/Rome').utc()); // "Today", at 07:30
      // ...and ending at
      calendar.event.endDate.push(moment.tz(date+"T08:30", 'Europe/Rome').utc()); // "Today", at 08:30
      for (var i = 0; i < Object.keys(timetable).length; i++) { // For all the keys in time table. i.e. 5 times
        const currentClass = classes['p'+periods[summary.split('-')[0]][i]];
        // TODO: DP Flex handling
        // TODO: Empty class handling
        // Create an event called...
        calendar.event.name.push(currentClass.value[isS2 ? 's2' : 's1']); // e.g. classes['p'+periods['A'][0]] == Period 1
        // ...starting at...
        calendar.event.startDate.push(moment.tz(date+timetable['P'+(i+1)].start, 'Europe/Rome').utc()); // e.g. "Today", at 13:25
        // ...and ending at
        calendar.event.endDate.push(moment.tz(date+timetable['P'+(i+1)][currentClass.hl ? 'end_hl' : 'end'], 'Europe/Rome').utc()); // e.g. "Today", at 14:30
      }
    }
  }
  return calendar; // Return the filled up calendar
}

exports.generateCalendar = async function(req, res) {
  // BUG: new user classes not created
  const user = await User.findOne({
    email: req.session.user.email
  });
  const calendar = setupCalendar(user.classes);
  var cal = generateCal({
    name: 'Schedule',
    timezone: 'Europe/Rome'
  });
  for (var i = 0; i < calendar.event.name.length; i++) {
    // TODO: Alerts
    cal.createEvent({
      start: calendar.event.startDate[i].toDate(),
      end: calendar.event.endDate[i].toDate(),
      summary: calendar.event.name[i]
    })
  }

  fs.readdir('./calendars', function(err, items) {
    console.log(items);

    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
    }
  });

  fs.writeFileSync(`./calendars/cal.txt`, cal.toString(), function(err) {
    if (err) throw err
    console.log("Done");
  });
  res.redirect('https://calendar.google.com/calendar/r?cid=webcal://'+path.join(__dirname, `../calendars/${user._id}.ics`))
};
