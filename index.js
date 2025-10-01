const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const mega = require("megajs");

const app = express();
const port = process.env.PORT || 3000;

// Helper: generate random alphabet-only prefix of given length
function randomAlphaPrefix(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

app.get("/", (req, res) => {
  res.send(`
    <h1>WhatsApp Session Generator</h1>
    <form action="/pair" method="get">
      <label>Enter Phone Number (e.g. 94712345678):</label><br>
      <input type="text" name="number" required>
      <button type="submit">Generate Pair Code</button>
    </form>
    <p>⚠️ Replace YOUR_MEGA_EMAIL and YOUR_MEGA_PASSWORD in index.js before running.</p>
  `);
});

app.get("/pair", async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["Chrome (Linux)", "Chrome", "1.0.0"],
    mobile: false
  });

  const phoneNumber = req.query.number;
  if (!phoneNumber) return res.send("❌ Please provide number as ?number=947XXXXXXXX");

  try {
    const code = await sock.requestPairingCode(phoneNumber);
    res.send(`<h1>📲 Pair Code: <b>${code}</b></h1><p>Enter this in WhatsApp app.</p>`);
  } catch (err) {
    console.error(err);
    return res.send("❌ Error generating pair code");
  }

  sock.ev.on("creds.update", async () => {
    await saveCreds();

    if (fs.existsSync("session/creds.json")) {
      const creds = fs.readFileSync("session/creds.json", "utf8");

      // 🔹 Create alphabet-only prefix and session ID
      const prefix = randomAlphaPrefix(16); // change length if you want
      const sessionID = prefix + "~" + Buffer.from(creds).toString("base64").slice(0, 60);

      // 🔹 Upload full creds.json to MEGA
      const storage = new mega.Storage({
        email: "agni119.67@gmail.com",
        password: "shashika@2008"
      }, () => {
        const file = storage.upload("session.json");
        file.write(creds);
        file.end();

        file.on("complete", () => {
          console.log("✅ Session uploaded to MEGA successfully!");
        });
        file.on("error", (e) => {
          console.error("MEGA upload error:", e);
        });
      });

      // 🔹 Send Session ID string to WhatsApp number
      const jid = phoneNumber + "@s.whatsapp.net";
      try {
        await sock.sendMessage(jid, { text: `✅ Your Session ID:\n${sessionID}` });
        console.log("📤 Session ID sent to WhatsApp:", phoneNumber);
      } catch (e) {
        console.error("Error sending session ID to WhatsApp:", e);
      }
    }
  });
});

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
