require('dotenv').config();
const { google } = require('googleapis');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron'); 
const app = express();
const port = 3000;

const TOKEN_PATH = path.join(__dirname, '/db/auth.json');
const EVENT_PATH = path.join(__dirname, '/db/event.json');
const API_KEY = process.env.API_KEY; 

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
    return events.length ? events.map(event => ({
        start: event.start.dateTime || event.start.date,
        summary: event.summary,
    })) : [];
}

function shouldUpdateEvents() {
    if (!fs.existsSync(EVENT_PATH)) return true;

    const stats = fs.statSync(EVENT_PATH);
    const lastModified = new Date(stats.mtime);
    const now = new Date();

    return (now - lastModified) > 24 * 60 * 60 * 1000; 
}

async function updateEvents() {
    for (const token of tokens) {
        oauth2Client.setCredentials(token);
        const events = await listEvents(oauth2Client);

        if (shouldUpdateEvents()) {
            fs.writeFileSync(EVENT_PATH, JSON.stringify(events, null, 2));
            console.log('Events updated:', events);
        } else {
            const existingEvents = JSON.parse(fs.readFileSync(EVENT_PATH));
            if (JSON.stringify(events) !== JSON.stringify(existingEvents)) {
                fs.writeFileSync(EVENT_PATH, JSON.stringify(events, null, 2));
                console.log('Events updated due to changes:', events);
            }
        }
    }
}

cron.schedule('0 * * * *', updateEvents);

function verifyApiKey(req, res, next) {
    const apiKey = req.query.api_key;
    if (apiKey && apiKey === API_KEY) {
        next(); 
    } else {
        res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
}

app.get('/api', verifyApiKey, (req, res) => {
    if (fs.existsSync(EVENT_PATH)) {
        const events = JSON.parse(fs.readFileSync(EVENT_PATH));
        res.json(events);
    } else {
        res.status(404).json({ message: 'No events found' });
    }
});

app.get('/', (req, res) => {
    res.render('dashboard', { 
        accounts: tokens,
        formatTimestamp: (timestamp) => new Date(timestamp).toLocaleString(),
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

updateEvents()
