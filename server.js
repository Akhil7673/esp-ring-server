import express from "express";
import fetch from "node-fetch";
import { google } from "googleapis";
import cors from "cors";
import googleTTS from "google-tts-api";

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Google credentials
const CLIENT_ID = "146022619799-sl8gufnrri0oivspdbkpb0nc42ntmdjo.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//0g6p2Ug1sxKghCgYIARAAGBASNwF-L9Ir8fVw4oU0be-VRRvAu1sGW0cIcMhH-e_Z7fvm6D57_6GfjJztdmP_BqTl_YaUuG1790Y";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// 🔧 Helper: Get access token
async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });
  const data = await res.json();
  return data.access_token;
}

// ✅ Status check
app.get("/", (req, res) => {
  res.send("✅ ESP Ring Server is Live and linked with Google Assistant!");
});

// 📱 List user devices (Find My Device)
app.get("/devices", async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await fetch("https://www.googleapis.com/androidfind/v1/devices", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch devices.");
  }
});

// 🔔 Ring specific device
app.post("/ring", async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  try {
    const token = await getAccessToken();
    const response = await fetch(`https://www.googleapis.com/androidfind/v1/devices/${deviceId}:ring`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to ring device." });
  }
});

// 🗣️ Text-to-speech (for ESP32 speaker)
app.get("/speak", async (req, res) => {
  try {
    const text = req.query.text || "Hello Akhil, your ESP Ring is ready.";
    const lang = req.query.lang || "en";
    const url = googleTTS.getAudioUrl(text, { lang, slow: false });
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
