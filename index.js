// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Google Assistant credentials
const CLIENT_ID = "146022619799-sl8gufnrri0oivspdbkpb0nc42ntmdjo.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//0g6p2Ug1sxKghCgYIARAAGBASNwF-L9Ir8fVw4oU0be-VRRvAu1sGW0cIcMhH-e_Z7fvm6D57_6GfjJztdmP_BqTl_YaUuG1790Y";

// Generate new access token using refresh token
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

// Example route to test Google Assistant response
app.get("/", (req, res) => {
  res.send("✅ ESP Ring Server is Live and linked with Google Assistant!");
});

app.post("/ask", async (req, res) => {
  const query = req.body.query;
  if (!query) return res.status(400).send("Missing 'query' in request body.");

  try {
    const accessToken = await getAccessToken();
    const response = await fetch("https://embeddedassistant.googleapis.com/v1alpha2/projects/my-project-id/conversations:sendTextQuery", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query_input: {
          text: { text: query, language_code: "en-US" }
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error communicating with Google Assistant.");
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));
