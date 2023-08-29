import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
/* import { OAuth2Client } from 'google-auth-library'; */
import { google } from "googleapis";
import dayjs from "dayjs";
import {v4 as uuid} from 'uuid'

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

dotenv.config({});

const app = express();

const PORT = 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
const scopes = ["https://www.googleapis.com/auth/calendar"];


app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  res.send({
    msg: "You have succesfully logged in",
  });
});

app.get("/schedule_event", async (req, res) => {
  /* await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    conferenceDataVersion : 1,
    requestBody: {
      summary: "This is a test event",
      description: "some event",
      start: {
        dateTime: dayjs(new Date()).add(1, "day").toISOString(),
        timeZone: "Brazil/DeNoronha",
      },
      end : {
        dateTime: dayjs(new Date()).add(1, "day").add(1 , "hour").toISOString(),
        timeZone: "Brazil/DeNoronha",
      },
      conferenceData : {
        createRequest : {
          requestId : uuid(),
        },
      },
      attendees : [
        {
          email : "testeEmail@gmail.com"
        }
      ]
    },
  });

  res.send({
    msg : "done"
  }) */

  let today = new Date();
  let nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const response = await calendar.events.list({
    calendarId: "primary",
    auth: oauth2Client,
    timeMin: today.toISOString(), // A partir de hoje
    timeMax: nextWeek.toISOString(), // Até uma semana a partir de hoje
    maxResults: 3,
    singleEvents: true, 
    orderBy: "startTime" 
  });

  res.send({
    msg : response.data,
  })

  console.log(response.data);
});

app.listen(PORT, () => {
  console.log("server started on port ", PORT);
});
