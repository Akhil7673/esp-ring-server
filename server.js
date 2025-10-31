import express from "express";
import fetch from "node-fetch";
import { google } from "googleapis";
import cors from "cors";
import googleTTS from "google-tts-api";

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Google credentials (keep them the same)
const CLIENT_ID = "146022619799-sl8gufnrri0oivspdbkpb0nc42ntmdjo.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//0g6p2Ug1sxKghCgYIARAAGBASNwF-L9Ir8fVw4oU0be-VRRvAu1sGW0cIcMhH-e_Z7fvm6D57_6GfjJztdmP_BqTl_YaUuG1790Y";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// 🔧 Helper: Get access token (for future use)
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

// 📱 Mock device list (since Google’s API is private now)
const devices = [
  { id: "phone1", name: "Akhil’s Pixel 6" },
  { id: "watch1", name: "Akhil’s Smartwatch" },
  { id: "tablet1", name: "Akhil’s Tablet" }
];

// 📱 List devices
app.get("/devices", async (req, res) => {
  try {
    res.json({ devices });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch devices.");
  }
});

// 🔔 Simulated ring
app.post("/ring", async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  const device = devices.find((d) => d.id === deviceId);
  if (!device) return res.status(404).json({ error: "Device not found" });

  console.log(`🔔 Ringing ${device.name}...`);
  res.json({ message: `Ringing ${device.name}... 🔔` });
});

// 🗣️ Text-to-speech (for LM386 speaker)
app.get("/speak", async (req, res) => {
  try {
    const text = req.query.text || "Hello Akhil, your ESP Ring is ready.";
    const lang = req.query.lang || "en";
    const url = googleTTS.getAudioUrl(text, { lang, slow: false });
    res.redirect(url); // plays audio directly
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS failed." });
  }
});

// 🌐 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
