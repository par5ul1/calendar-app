# Hello

This program is what I made to generate a custom calendar for each student at my High School. As promised to the administration, I have made this open-source in the case that the school decides to continue this service. It will most likely not serve anyone else because this is highly customized but I will still make it public in case anyone is curious to see how this works.

The software will be provided as is and I cannot make any guarantees regarding the maintenance of it.

Furthermore, the version on my website will continue to be hosted until next year (2020). As far as I know, it still works. If it doesn't, just open an issue on GitHub and I'll see if I can find a fix but once again, I can't make promises.

## Setup

There are various things that need to be done in order to set this program up. But before I get into the instructions, here's some basic information regarding how it works:

- The whole thing is written in NodeJS.
- The program scrapes the publicly available iCal file from the school and populates a JSON file.
- The student logs in using their Google Account (handled by Passport.js). This is only used to keep their calendar up-to-date.
- The student inserts their classes.
- These classes are used alongside the aforementioned JSON which is then converted into an iCal file and saved in a MongoDB database (hosted on mLab) under the student's email.

Alright. Now onto the setup.

### calendarController.js

Navigate to _controllers/calendarController.js_. This is where the majority of the program happens. Feel free to see how everything works but for now, the most important line is line 15:
`let res = await fetch("<LINK TO ICS FILE>");`

Here, replace, <LINK TO ICS FILE> (including the <>) with the link to the ics file from the website.

Another important line is line 60:
`const semesterEnd = '2020-01-23';`

Here, replace the date 2020-01-23 with the exact day when the first semester ends (starting 2021 as this is already set for 2020).

### variables.env
The variables.env is where most of the setup will recorded. For local testing, you should create such a file but for production, the variables will be inserted into Heroku, which I will get into later.

The variables are as follows:

`GOOGLE_CLIENT_ID` - A client ID provided by Google when you create a new app

`GOOGLE_CLIENT_SECRET` - A client secret provided by Google when you create a new app

`SECRET` - It can literally be anything. Just pick something like "SALTY PICKLES"

`DATABASE` - This is where you provide the MongoDB database link from mLab. It will look like this:
> _mongodb://user:password@dsxxxxxx.mlab.com:xxxxx/name-of-project_

For now, you will not have any of the information needed for this but once you finish the setup, you will have found everything you need.

### Passport.js and GoogleAuth

This part is quite simple.

Just go to:
https://console.developers.google.com/?pli=1

Create a new Project.

Select the project and click on **Credentials**. Click **Create credentials** and select **Create client id**.

Fill out the form and take note of your client id and client secret.

You're done here for now.

### mLab

For this, I'll just let the [docs](https://docs.mlab.com/) do the talking. Follows Steps 1 and 2 to make your free account. For Step 3, all that matters is this:

> You can create a database user and password and grab your connection info after logging into your account and navigating to the database’s home page.

Then just take note of the link that looks like this in your dashboard:

_mongodb://user:password@dsxxxxxx.mlab.com:xxxxx/name-of-project_

Of course, the user and password will be the credentials you just created in Step 3.

### Heroku

This is the last part of this setup. Once you have everything together, it's time to deploy it to the web.

First thing you'll need is a Heroku account so head on to [this](https://signup.heroku.com/) page to sign-up.

Once you have your account, create a new app. Give it a name and follow the instructions to install the CLI on your computer. Then run the code provided under _Existing Git repository_ in this repository (which you should have cloned on your machine).

After than, just run the code provided in Heroku under _Deploy your application_.

Here's also where you will add the variables. On your Heroku app page, go to **Settings>Config Vars>Reveal Config Vars**. Then just add the config variables from the _variables.env_ section as the keys and for the values, input the information you gathered along the way.

At this point, you're done. You just need to host this on your own domain and make sure to add that domain to the Google project you created earlier.

In order to update the calendars (in the case that something changes with the school or the cached calendar does not extend all the way until the end of the year) all you need to do is run _updateAllCalendars.js_ found in the root of this project. However, in order to do this, you need a local variables.env file with all the same information as Heroku. Alternatively you could just re-run the whole project from Heroku. Personally, I just used a free addon called _Heroku Scheduler_ to run `node updateAllCalendars` every day.

And with that. You are all set up.

### Questions and Issues

As mentioned at the beginning, this project is really not worth maintaining. I am providing it as is, with a half-decent startup guide but I cannot make any other promises. If you have a question, open an issue on this repo and I will see if I can help but there are no guarantees.

Hope this document helped set everything up.

Have a nice `timeOfDay()`
