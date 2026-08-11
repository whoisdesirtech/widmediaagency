# Google Drive Setup (vendor uploads)

Vendors (contractors) can upload photos straight into the client's shared Google Drive
folder. This uses the Google Drive API with a **service account**. Follow these steps
once; then set the credentials and share folders with the service account.

## 1. Create a service account

1. Go to <https://console.cloud.google.com> and create/select a project (e.g. `widmediaagency`).
2. Enable the **Google Drive API**:
   APIs & Services → Library → search "Google Drive API" → Enable.
3. APIs & Services → **Credentials** → **Create credentials** → **Service account**.
   - Name it `widmedia-drive-upload` → Create → Done.
4. Open the service account → **Keys** tab → **Add Key** → **Create new key** → **JSON** → Create.
   This downloads a JSON file (keep it safe).

## 2. Set the credentials

From the downloaded JSON, grab:

| Env var | JSON field |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` |
| `GOOGLE_PRIVATE_KEY` | `private_key` |

The key is a multi-line string — keep it on one line in the env file with the line
breaks escaped as `\n`. In Vercel, add both vars under **Project Settings → Environment Variables**
and redeploy.

## 3. Share folders with the service account

For every client folder vendors should upload into, open the folder in Google Drive →
**Share** → add the service account email (`GOOGLE_SERVICE_ACCOUNT_EMAIL`) with
**Editor** permission. Files the service account uploads belong to your Drive and are
instantly visible to anyone the folder is shared with (client, vendor, admin).

## 4. Verify

- Log in as a contractor → open a project → **Deliver Photos to Client Drive**.
- Pick a folder, select photos, upload. The photos appear in the shared folder.

## Notes

- If uploads return a **403 / permission error**, the folder hasn't been shared with the
  service account email yet (see step 3).
- If uploads return **503**, the env vars aren't set.
- The vendor portal only shows folders that already have a Drive folder linked
  (set under Clients → Media Gallery / Folders in the admin portal).
