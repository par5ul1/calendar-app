const fetch = require('node-fetch');

fetch("https://www.asmilan.org/data/calendar/icalcache/feed_4961866F0A1F4803879866A56CA8EC4F_gmt.ics")
  .then(res => res.text())
  .then(body => console.log(body))
