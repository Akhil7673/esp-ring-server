import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// Your Google OAuth credentials
const CLIENT_ID = "146022619799-sl8gufnrri0oivspdbkpb0nc42ntmdjo.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//0g6p2Ug1sxKghCgYIARAAGBASNwF-L9Ir8fVw4oU0be-VRRvAu1sGW0cIcMhH-e_Z7fvm6D57_6GfjJztdmP_BqTl_YaUuG1790Y";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Simple status check
app.get("/", (req, res) => {
  res.send("✅ ESP-Ring Server is Live");
});

// Simulated ring endpoint
app.post("/ring", async (req, res) => {
  try {
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    console.log("🔔 Ring command received!");
    // You could later add code here to use Google Assistant API for real ring.

    res.json({ message: "Ringing your device now 🔔" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger ring" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
