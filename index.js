//index.js code for integrating Google Calendar 

const cal_secrets = require('./calendar-api-credentials.json');

const express = require('express');
const { google } = require('googleapis');

const app = express();

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY = cal_secrets.private_key;
const GOOGLE_CLIENT_EMAIL = cal_secrets
const GOOGLE_PROJECT_NUMBER = "10319313363"
const GOOGLE_CALENDAR_ID = "c2cc6d7196bf9d5d9feedc9f399de3b60df8e4056d29c887a1005efa67fcf7cb@group.calendar.google.com"


const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
);

const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
});

app.get('/', (req, res) => {

    calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (error, result) => {
        if (error) {
            res.send(JSON.stringify({ error: error }));
        } else {
            if (result.data.items.length) {
                res.send({ events: result.data.items });
            } else {
                res.send(JSON.stringify({ message: 'No upcoming events found.' }));
            }
        }
    });
});

// create new function to get freebusy data
// timeMin and timeMax hardcode for now
// give me utc time zone
app.get('/freebusy', (req, res) => {
    calendar.freebusy.query({
        resource: {
            timeMin: '2024-02-01T00:00:00Z',
            timeMax: '2024-02-28T00:00:00Z',
            items: [{ id: GOOGLE_CALENDAR_ID }]
        }
    }, (error, result) => {
        if (error) {
            res.send({ error: error });
        } else {
            res.send(result.data);
        }
    });
});

app.listen(3000, () => console.log(`App listening on port 3000!`));

// This code is contributed by Yashi Shukla
