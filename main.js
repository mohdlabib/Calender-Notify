require('dotenv').config();
const { google } = require('googleapis');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron'); 
const { log } = require('console');
const app = express();
const port = 3000;

const TOKEN_PATH = path.join(__dirname, '/db/token.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.SECRET_ID,
    process.env.REDIRECT
);

let tokens = [];
if (fs.existsSync(TOKEN_PATH)) {
    tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
}

app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
    });
    res.redirect(authUrl);
});

app.get('/redirect', async (req, res) => {
    const { code } = req.query;
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(newTokens);
    const email = await getUserEmail(oauth2Client);
    newTokens.email = email;
    tokens.push(newTokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

    res.redirect('/'); 
});

async function getUserEmail(auth) {
    const people = google.people({ version: 'v1', auth });
    const res = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
    });
    const emails = res.data.emailAddresses;
    return emails && emails.length > 0 ? emails[0].value : 'No email found';
}

async function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    const today = new Date();
    const startTime = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endTime = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    if (events.length) {
        return events.map(event => {
            const start = event.start.dateTime || event.start.date;
            return { start, summary: event.summary }; 
        });
    } else {
        return [];
    }
}

async function sendEventsToApi(events) {
    const apiUrl = 'YOUR_API_ENDPOINT';
    
    // esekusi api
}

// Atur Perharii
cron.schedule('0 0 * * *', async () => {
    for (const token of tokens) {
        oauth2Client.setCredentials(token);
        const events = await listEvents(oauth2Client);
        if (events.length > 0) {
            await sendEventsToApi(events);
        }
    }
});

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('en-US', options);
}

app.get('/', (req, res) => {
    res.render('dashboard', { 
        accounts: tokens, 
        formatTimestamp: formatTimestamp 
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
