# WhatsApp Session Generator (Pair Code → Session → Mega + WhatsApp)

This project creates WhatsApp Pair Codes, converts the generated credentials (creds.json) into a short session ID string with an **alphabet-only prefix**, uploads the full creds.json to MEGA.nz, and sends the short session ID string to the user's WhatsApp number.

## Setup

1. Clone or unzip this project.
2. Install dependencies:
```bash
npm install
```

3. Edit `index.js` and replace the MEGA credentials:
```js
email: "YOUR_MEGA_EMAIL",
password: "YOUR_MEGA_PASSWORD"
```

## Run
```bash
npm start
```

## Usage
Open in browser:
```
http://localhost:3000/pair?number=94712345678
```
- Enter the Pair Code shown into WhatsApp's *Link a Device → Link with phone number* flow.
- When the session is created:
  - `session/creds.json` will be generated.
  - Full `creds.json` will be uploaded to your MEGA account (as `session.json`).
  - A short session ID string with an alphabet-only prefix (e.g. `abcdefghijklmnop~...`) will be sent to the WhatsApp number as a text message.

## Notes
- The prefix is alphabet-only (lowercase) and length 16 by default. Change in `randomAlphaPrefix(16)`.
- Keep your MEGA credentials safe. This project stores credentials only in memory when uploading.
- The generated session ID is derived from the base64 of creds.json (shortened). Do not share it publicly if you care about privacy.

