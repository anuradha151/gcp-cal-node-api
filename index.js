const cal_secrets = require('./calendar-api-credentials.json');

const dotenv = require('dotenv');
const express = require('express');
const { google } = require('googleapis');

const app = express();
dotenv.config();

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY = cal_secrets.private_key;
const GOOGLE_CLIENT_EMAIL = cal_secrets.client_email;
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;


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

