import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const app = getApps()[0] || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);
const staffEmail = (username: string) => `${username.trim().toLowerCase().replace(/\s+/g, "-")}@staff.jackx.app`;

async function requireAdmin(req: any) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) throw new Error("unauthenticated");
  const decoded = await adminAuth.verifyIdToken(header.slice(7));
  const email = String(decoded.email || "").toLowerCase();
  const staff = email ? await adminDb.collection("staff").doc(email).get() : null;
  const role = String(staff?.data()?.role || "").toLowerCase();
  const fixedAdmins = ["admin@jackx.app", "admin@staff.jackx.app", "adminmosaad@staff.jackx.app"];
  if (decoded.admin !== true && !["admin", "manager", "مدير"].includes(role) && !fixedAdmins.includes(email)) throw new Error("permission-denied");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "method-not-allowed" });
  try {
    await requireAdmin(req);
    const body = req.body || {};
    const action = String(body.action || "save");
    const username = String(body.username || "").trim();
    const email = String(body.email || (username ? staffEmail(username) : "")).toLowerCase();
    const previousEmail = String(body.previousEmail || "").toLowerCase();
    if (!email) return res.status(400).json({ error: "username-required" });

    if (action === "delete") {
      const target = await adminAuth.getUserByEmail(email);
      await adminAuth.deleteUser(target.uid);
      await adminDb.collection("staff").doc(email).delete();
      return res.status(200).json({ ok: true });
    }
    if (action === "resetPassword") {
      const password = String(body.password || "");
      if (password.length < 6) return res.status(400).json({ error: "weak-password" });
      const target = await adminAuth.getUserByEmail(email);
      await adminAuth.updateUser(target.uid, { password });
      return res.status(200).json({ ok: true });
    }

    const password = String(body.password || "");
    const active = body.active !== false;
    let target: any;
    try {
      target = await adminAuth.getUserByEmail(email);
      target = await adminAuth.updateUser(target.uid, {
        ...(password ? { password } : {}),
        disabled: !active,
        displayName: username || target.displayName || email.split("@")[0],
      });
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found" || password.length < 6) throw error;
      target = await adminAuth.createUser({ email, password, disabled: !active, displayName: username });
    }

    await adminDb.collection("staff").doc(email).set({
      email,
      username: username || email.split("@")[0],
      phone: String(body.phone || "—"),
      role: String(body.role || "cashier"),
      active,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (previousEmail && previousEmail !== email) {
      await adminDb.collection("staff").doc(previousEmail).delete();
      try {
        const previousUser = await adminAuth.getUserByEmail(previousEmail);
        await adminAuth.updateUser(previousUser.uid, { email });
      } catch { /* Firestore-only legacy record */ }
    }
    return res.status(200).json({ ok: true, uid: target.uid, email });
  } catch (error: any) {
    console.error("admin-staff error", error);
    const code = error?.message === "permission-denied" ? 403 : error?.message === "unauthenticated" ? 401 : 400;
    return res.status(code).json({ error: error?.code || error?.message || "request-failed" });
  }
}
