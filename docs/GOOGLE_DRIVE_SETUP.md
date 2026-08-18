# Google Drive Setup (vendor uploads)

Vendors (contractors) can upload photos straight into the client's shared Google Drive
folder. This uses the Google Drive API with a **service account**. Follow these steps
once; then set the credentials and share folders with the service account.

## 1. Create a service account

1. Go to <https://console.cloud.google.com> and create/select a project (e.g. `whoisdesir-media`).
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

## 3. Put client folders in a shared drive and share it

Service accounts have **no storage quota** in a personal Drive ("My Drive") and can't upload
there, even when a folder is shared with them. They can only upload into a **shared drive**.
So client folders must live inside a shared drive:

1. In Google Drive (the agency account) → **Shared drives** → **+ New** → name it
   (e.g. "WhoisDesir Media") → Create.
2. Create every client folder **inside** the shared drive (e.g.
   `/Shared drives/WhoisDesir Media/<Client Name>/`).
   If a folder already exists in My Drive, move it in: right-click → **Organize → Move** →
   pick the shared drive. The folder keeps its ID, so all existing links keep working.
3. Share the **shared drive** with the service account: open the shared drive → **Share** →
   add `GOOGLE_SERVICE_ACCOUNT_EMAIL` with **Content manager** → Send. Membership applies to
   every folder inside it.

Files the service account uploads belong to your Drive and are instantly visible to anyone
the folders are shared with (client, vendor, admin).

## 4. Verify

- Log in as a contractor → open a project → **Deliver Photos to Client Drive**.
- Pick a folder, select photos, upload. The photos appear in the shared folder.

## Notes

- If uploads return a **403 / permission error**, the folder isn't in a shared drive the
  service account belongs to (see step 3).
- If uploads return **503**, the env vars aren't set.
- My Drive folders fail with *"Service Accounts do not have storage quota"* — move them into
  the shared drive.
- The vendor portal only shows folders that already have a Drive folder linked
  (set under Clients → Media Gallery / Folders in the admin portal).
