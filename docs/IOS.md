# Vidura Life on iPhone: setup guide

The iOS app is the same web app, wrapped with Capacitor (`ios/`). Codemagic builds it on a
cloud Mac and uploads it to TestFlight, so you never need a Mac. Every key goes straight into
Codemagic. The only value to pass back to the developer is your **Team ID**.

Bundle ID: `com.viduralife.app` (set in `capacitor.config.ts` and `codemagic.yaml`).

---

## 1. Join the Apple Developer Program ($99/year)

1. Go to <https://developer.apple.com/programs/enroll/> and sign in with your Apple Account.
2. Turn on two-factor authentication if Apple asks.
3. Enroll as an **Individual** (quickest). An Organization needs a D-U-N-S number.
4. Pay the fee. Approval usually takes a few hours, sometimes up to 2 days.
5. When it's approved, open <https://developer.apple.com/account> → **Membership details**
   and copy the **Team ID** (10 characters, like `A1B2C3D4E5`). **Send this to the developer.**

## 2. Register the App ID (with Associated Domains)

1. <https://developer.apple.com/account/resources/identifiers/list> → **+**.
2. Choose **App IDs** → **App** → Continue.
3. Description: `Vidura Life`. Bundle ID: **Explicit** → `com.viduralife.app`.
4. Under Capabilities, tick **Associated Domains**. Leave Push Notifications off: reminders
   are local and don't need it.
5. Continue → Register.

## 3. Create the app in App Store Connect

1. <https://appstoreconnect.apple.com/apps> → **+** → **New App**.
2. Platform **iOS**, Name `Vidura Life` (try `Vidura Life: Daily Wellness` if it's taken),
   language English, Bundle ID `com.viduralife.app`, SKU `vidura-life-ios`, access **Full Access**.

## 4. Create the App Store Connect API key

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** →
   **Team Keys** (request access the first time) → **+**.
2. Name `Codemagic`, Access **App Manager** → Generate.
3. Note the **Issuer ID** (above the table) and the key's **Key ID**.
4. **Download API Key** gives `AuthKey_XXXX.p8`. You can download it **only once**, so keep it safe.

## 5. Make the certificate key (on your Windows PC)

In PowerShell (OpenSSH comes with Windows 10):

```powershell
ssh-keygen -t rsa -b 2048 -m PEM -f "$env:USERPROFILE\Desktop\cert_key"
```

Press Enter twice when it asks for a passphrase (leave it empty). This creates `cert_key` on your Desktop. Codemagic uses it to create and reuse your
distribution certificate. Keep it private and don't commit it.

## 6. Connect Codemagic

1. Sign up at <https://codemagic.io/signup> with **GitHub**, and allow access to
   `sampathgoud42/vidura-life-app`.
2. **Add application** → GitHub → `vidura-life-app` → project type **Other**
   (Codemagic reads `codemagic.yaml`).
3. Go to **Teams → your team → Global variables and secrets** (or the app's **Environment variables**).
   Create these, ticking **Secret** for each:

   | Group | Variable | Value |
   |---|---|---|
   | `app_store_credentials` | `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID from step 4 |
   | `app_store_credentials` | `APP_STORE_CONNECT_KEY_IDENTIFIER` | Key ID from step 4 |
   | `app_store_credentials` | `APP_STORE_CONNECT_PRIVATE_KEY` | the whole text of `AuthKey_XXXX.p8` |
   | `app_store_credentials` | `CERTIFICATE_PRIVATE_KEY` | the whole text of `cert_key` from step 5 |
   | `firebase` | `VITE_FIREBASE_API_KEY` | the Firebase Web API key (the same one in `.env.local`) |

   To copy a file's text: `Get-Content "$env:USERPROFILE\Desktop\cert_key" -Raw | Set-Clipboard`.
4. Start a build: **Start new build** → branch `ios-app` → workflow **iOS → TestFlight**.
   After this, every push to `ios-app` builds automatically. The free tier gives 500 Mac minutes
   a month; one build takes about 10–15 minutes.

## 7. Install it with TestFlight

1. Once the build succeeds, it appears in App Store Connect → your app → **TestFlight** after
   Apple's processing (about 10–30 minutes).
2. Add yourself under **Internal Testing** and install the **TestFlight** app on your iPhone.
   You'll get an invite.

## 8. Things the developer finishes after you send the Team ID

- Replaces `TEAM_ID` in `public/.well-known/apple-app-site-association` and deploys the website.
  Emailed sign-in links then open the app directly (Universal Links).
- Sets the support email shown in `public/privacy.html`.

## 9. Before submitting for App Review

- **Privacy Policy URL:** `https://vidura-life-app.web.app/privacy.html`
- **App Privacy** questionnaire:
  - Data collected: **Contact Info → Name, Email Address**, purpose **App Functionality**.
  - Linked to the user: yes. Used for tracking: **no**.
  - Nothing else is collected; health choices stay on the device.
- **Account deletion:** Settings → Your data → *Delete my account* (Apple requires this).
- **Screenshots (6.9" iPhone, 1320×2868):** run `npm run ios:screenshots`; they're saved in
  `store/screenshots/iphone-6.9/`.
- **Category:** Health & Fitness. Age rating questionnaire: all "None".
- **Review notes:** "General wellness information, not medical advice. Sign-in is by an emailed link to any address you control."
- **Encryption:** already declared in Info.plist (`ITSAppUsesNonExemptEncryption = false`).

---

## For developers

```powershell
npm run ios:sync          # build the web app and copy it into ios/
npm run ios:screenshots   # App Store screenshots
```

- Native plugins load only inside the app (`src/lib/native.ts`). The web build is unchanged
  and doesn't register the service worker inside the app.
- Inside the app, emailed links use `https://vidura-life-app.web.app/` as the continue URL.
  Universal Links (AASA + `App.entitlements`) hand it to the app.
- Account deletion (`src/lib/account.ts`): refresh the saved Firebase token, then
  `DELETE /api/wellness/contact` (the server only deletes the row matching the verified token),
  then Firebase `accounts:delete`, then wipe local data. Users without a saved token confirm
  by email first.
