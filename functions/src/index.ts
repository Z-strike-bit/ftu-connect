import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import nodemailer from 'nodemailer';

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Blocklist of free email domains (lowercase). Treat others as allowed.
const BLOCKLIST = new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','protonmail.com']);

function extractDomain(email: string) {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

function extractCompanyName(domain: string) {
  // naive: take first segment before TLD/second-level domain
  // e.g. nab.com.vn -> nab | google.com -> google
  const parts = domain.split('.');
  if (parts.length === 0) return domain;
  return parts[0].toUpperCase();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure transporter from env
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

// Cloud Function callable: action = 'send' | 'verify'
export const verifyCompanyEmailOTP = onCall(async (req) => {
  const data = req.data || {};
  const action = data.action;
  const email: string = (data.email || '').trim().toLowerCase();
  const uid: string = (data.uid || req.auth?.uid) || null;

  if (!email) return { success: false, error: 'missing_email' };

  const domain = extractDomain(email);
  if (!domain) return { success: false, error: 'invalid_email' };

  if (action === 'send') {
    if (BLOCKLIST.has(domain)) return { success: false, error: 'domain_blocked' };

    const code = generateOtp();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));

    // store OTP
    await db.collection('otp_codes').add({ email, code, expiresAt, used: false });

    // send email
    const transporter = createTransporter();
    if (!transporter) return { success: false, error: 'smtp_not_configured' };

    const mailHtml = `<p>Your FTU Connect verification code: <strong>${code}</strong></p><p>Expires in 10 minutes.</p>`;
    await transporter.sendMail({ from: process.env.GMAIL_USER, to: email, subject: 'FTU Connect verification code', html: mailHtml });

    return { success: true };
  }

  if (action === 'verify') {
    const code = (data.code || '').toString().trim();
    if (!code) return { success: false, error: 'missing_code' };

    // find matching un-used OTP
    const q = await db.collection('otp_codes').where('email', '==', email).where('code', '==', code).where('used', '==', false).orderBy('expiresAt', 'desc').limit(1).get();
    if (q.empty) return { success: false, error: 'invalid_code' };

    const doc = q.docs[0];
    const dataDoc: any = doc.data();
    const now = admin.firestore.Timestamp.now();
    if (dataDoc.expiresAt && dataDoc.expiresAt.toMillis() < now.toMillis()) return { success: false, error: 'expired' };

    // mark used
    await doc.ref.update({ used: true });

    // upgrade user tier via Admin SDK (bypass rules)
    if (!uid) return { success: false, error: 'missing_uid' };
    const company = extractCompanyName(domain);
    await db.collection('users').doc(uid).update({ tier: 2, verifiedCompany: company, verifiedStatus: 'approved' });

    return { success: true, company };
  }

  return { success: false, error: 'unknown_action' };
});
