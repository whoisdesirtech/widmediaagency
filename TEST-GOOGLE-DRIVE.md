# Google Drive Integration — End-to-End Test Script

> Run this locally against the dev server (`npm run dev`) to verify the full
> Google Drive flow: admin setup → vendor upload → client access.
>
> **Prerequisites:**
> - Dev server running on `http://localhost:3000`
> - `.env` has `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
> - A Shared Drive exists with the service account added as Editor
> - Service account: `widmedia-drive-upload@whoisdesir-media.iam.gserviceaccount.com`

---

## Test Data

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@whodesir.com` | `DreamVibez$1111` |
| Vendor | `asetvisions@gmail.com` | `EditQueen$1000` |
| Client | (check DB for existing client) | (generated via admin portal) |

---

## Step 1: Verify Admin Can Link Google Drive to a Client

### 1a. Check DB for a client with `googleDriveFolderId`

```sql
-- Run in Prisma Studio (npm run db:studio) or Supabase SQL editor
SELECT id, name, email, "googleDriveFolderId", "googleDriveFolderUrl"
FROM "Client"
WHERE "googleDriveFolderId" IS NOT NULL
LIMIT 5;
```

If no clients have a `googleDriveFolderId`, link one:
1. Go to `http://localhost:3000/admin/dashboard`
2. Click **Clients** → click a client name
3. Click **Edit Client**
4. Paste a Google Drive folder ID and URL → Save
5. Verify the Overview card shows **"✓ Linked"**

### 1b. Verify the folder exists in Google Drive

```bash
# List files in the folder using the service account
# (requires gcloud CLI or a quick Node script using driveService)
```

Or open the folder URL in a browser — it should be accessible and shared with the service account.

---

## Step 2: Verify Admin Can Assign Contractor to a Project

### 2a. Check DB for projects with `contractorId`

```sql
SELECT p.id, p.name, p."contractorId", c.name as contractor_name
FROM "Project" p
LEFT JOIN "Contractor" c ON c.id = p."contractorId"
LIMIT 10;
```

If no projects have a `contractorId`:
1. Go to `http://localhost:3000/admin/projects`
2. Click **+ New Project**
3. Select a client, enter a name, select a contractor from the dropdown
4. Click **Create Project**
5. Verify the project appears in the list

Or edit an existing project:
1. Click **Edit** on a project
2. Select a contractor from the "Assign Contractor" dropdown
3. Click **Save Changes**

---

## Step 3: Verify Vendor Can See Projects

1. Open `http://localhost:3000/login`
2. Log in as `asetvisions@gmail.com` / `EditQueen$1000`
3. Click **Projects** in the sidebar
4. **Expected:** You see at least one project assigned to you
5. Click into the project to expand it
6. **Expected:** You see the project timeline, images, and the "Deliver Photos to Client Drive" section

---

## Step 4: Verify Vendor Can See Drive Folder Dropdown

1. On the expanded project, scroll to **"📤 Deliver Photos to Client Drive"**
2. **Expected:** You see a folder dropdown (not the "No shared Google Drive folder" message)
3. The dropdown should show the client's Drive folder (either a sub-folder or the root folder)

If you see the dropdown:
- Select a folder
- Click **Choose Files** and select 1-2 test images
- Click **Upload Photos to Drive**
- **Expected:** Success message: "✅ X photos uploaded to Google Drive — shared with the client."

If you see "No shared Google Drive folder":
- The client doesn't have `googleDriveFolderId` set → go back to Step 1

---

## Step 5: Verify Client Can Access Media Gallery

1. Log out, then log in as the client (or generate client login via admin portal)
2. Click **Media Gallery** in the sidebar
3. **Expected:** You see the folder(s) — either sub-folders or the root "Media Folder"
4. Click into a folder
5. **Expected:** You see the files that the vendor uploaded (embedded Google Drive view)
6. Click **"Open in Google Drive"** to open in a new tab
7. **Expected:** The Google Drive folder opens with the uploaded files

---

## Step 6: Verify File Upload via API (Optional)

```bash
# Upload a test image directly via the API
curl -X POST http://localhost:3000/api/drive/upload \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "folderId=YOUR_FOLDER_ID" \
  -F "files=@/path/to/test-image.jpg"
```

**Expected:** Returns `{ files: [{ id, name, webViewLink }] }`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Vendor sees no projects | No `contractorId` on any project | Assign contractor in admin portal (Step 2) |
| "No shared Google Drive folder" | Client has no `googleDriveFolderId` | Link folder in admin portal (Step 1) |
| 403 on folder API | Contractor role not in allowed list | Already fixed — check deploy |
| 503 on upload | Google Drive credentials missing | Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` in Vercel |
| 403 on upload | Folder not shared with service account | Share folder with `widmedia-drive-upload@whoisdesir-media.iam.gserviceaccount.com` as Editor |
| Client gallery empty | No files uploaded yet, or wrong folder ID | Upload a test file as vendor, verify folder ID |
| "Service Accounts do not have storage quota" | Folder is in My Drive, not Shared Drive | Move folder to a Shared Drive |

---

## Quick DB Reset (If Needed)

```sql
-- Reset a project's contractor assignment
UPDATE "Project" SET "contractorId" = NULL WHERE id = 'PROJECT_ID';

-- Set a client's Google Drive folder
UPDATE "Client"
SET "googleDriveFolderId" = 'YOUR_FOLDER_ID',
    "googleDriveFolderUrl" = 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID'
WHERE email = 'client@example.com';

-- List all contractors
SELECT id, name, email FROM "Contractor";

-- List all clients
SELECT id, name, email, "googleDriveFolderId" FROM "Client";

-- List all projects with their contractor
SELECT p.id, p.name, p."contractorId", c.name as contractor
FROM "Project" p LEFT JOIN "Contractor" c ON c.id = p."contractorId";
```

---

## Success Criteria

- [ ] Admin can link a Google Drive folder to a client
- [ ] Admin can assign a contractor to a project
- [ ] Vendor sees assigned projects in their portal
- [ ] Vendor sees the Drive folder dropdown on the project
- [ ] Vendor can upload photos to Google Drive
- [ ] Client can see folders in their Media Gallery
- [ ] Client can view uploaded files (embedded + Google Drive link)
- [ ] Client can download files via "Open in Google Drive"
