# JACKX Admin API setup

The staff-management API is in `api/admin-staff.ts` and is called by the admin panel.
It verifies the signed-in Firebase user, checks the manager role in `staff`, then uses Firebase Admin SDK to create, update, disable, reset, or delete staff accounts.

Add these three Vercel environment variables to the `jackx-production` project for Production (and Preview if needed):

- `FIREBASE_PROJECT_ID` = `jackx-1a9d9`
- `FIREBASE_CLIENT_EMAIL` = the service account email
- `FIREBASE_PRIVATE_KEY` = the complete private key, preserving `\\n` line breaks

The private key must never be committed to GitHub or placed in frontend code. After adding the variables, redeploy the project. The deployed admin user will then manage staff accounts entirely from JACKX without opening Firebase Console.
