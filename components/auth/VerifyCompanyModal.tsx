"use client";

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';

export default function VerifyCompanyModal() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email'|'otp'|'done'>('email');
  const [msg, setMsg] = useState('');

  const sendOtp = async () => {
    setMsg('');
    try {
      const fns = getFunctions();
      const fn = httpsCallable(fns, 'verifyCompanyEmailOTP');
      const res = await fn({ action: 'send', email });
      if ((res.data && res.data.success)) {
        setStage('otp');
        setMsg('OTP sent. Check your email.');
      } else {
        setMsg('Error: ' + (res.data?.error || 'unknown'));
      }
    } catch (e: any) {
      setMsg(e.message || String(e));
    }
  };

  const verifyOtp = async () => {
    setMsg('');
    try {
      const fns = getFunctions();
      const fn = httpsCallable(fns, 'verifyCompanyEmailOTP');
      const uid = auth.currentUser?.uid;
      const res = await fn({ action: 'verify', email, code, uid });
      if ((res.data && res.data.success)) {
        setStage('done');
        setMsg('Verified. Company: ' + res.data.company);
      } else {
        setMsg('Error: ' + (res.data?.error || 'unknown'));
      }
    } catch (e: any) {
      setMsg(e.message || String(e));
    }
  };

  if (stage === 'done') return <div className="p-4">{msg}</div>;

  return (
    <div className="p-4">
      {stage === 'email' && (
        <div>
          <label className="block text-sm">Company email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="border p-2" placeholder="you@company.com" />
          <button onClick={sendOtp} className="ml-2 btn">Send OTP</button>
        </div>
      )}
      {stage === 'otp' && (
        <div>
          <label className="block text-sm">OTP</label>
          <input value={code} onChange={(e)=>setCode(e.target.value)} className="border p-2" placeholder="123456" />
          <button onClick={verifyOtp} className="ml-2 btn">Verify</button>
        </div>
      )}
      {msg && <p className="text-sm mt-2 text-red-600">{msg}</p>}
    </div>
  );
}
