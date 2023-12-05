require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const session = require("express-session");
const { error } = require("console");

const app = express();

app.set("view engine", "pug");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const REDIRECT_URI = `http://localhost:3000/oauth-callback`;
app.listen(3000, () => console.log("App running here:localhost:3000"));
const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=7d78e01a-a7d8-49d0-b56a-c54770130f14&redirect_uri=http://localhost:3000/oath-callback&scope=actions%20sales-email-read%20communication_preferences.read_write%20crm.objects.contacts.read%20crm.import%20communication_preferences.read%20communication_preferences.write%20crm.objects.contacts.write%20crm.schemas.contacts.read%20crm.schemas.contacts.write%20crm.export`;

const tokenStore = {};

app.use(
  session({
    secret: Math.random().toString(36).substring(2),
    resave: false,
    saveUninitialized: true,
  })
);
const isAuthorized = (userId) => {
  return tokenStore[userId] ? true : false;
};

// * 1. Send user to authorization page. This kicks off initial requeset to OAuth server.

app.get("/", async (req, res) => {
  if (isAuthorized(req.sessionID)) {
    const access_token = tokenStore[req.sessionID];
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };
    const contacts = "https://api.hubapi.com/crm/v3/objects/contacts";
    try {
      const response = await axios.get("contacts", { headers });
      const data = resp.data;
      res.render("home", { token: access_token, contacts: data.results });
    } catch (error) {
      console.error(error);
    }
  } else {
    res.render("home", { authUrl });
  }
});
// * 2. Get temporary authorization code from OAuth server.

// * 3. Combine temporary auth code wtih app credentials and send back to OAuth server.
app.get("/oauth-callback", async (req, res) => {
  //  res.send(req.query.code);
  const authCodeProof = {
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: req.query.code,
  };
  try {
    const response = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      querystring.stringify(authCodeProof)
    );
  } catch (error) {
    console.error(error);
  }
});

// * 4. Get access and refresh tokens.
tokenStore[req.sessionID] = responseBody.data.access_token;
res.redirect("/");
app.listen(3000, () => console.log("App running here: http://localhost:3000"));
