'use client';

import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // Step 1: enter email, Step 2: enter OTP + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: request OTP
  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:8000/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Failed to send OTP');
        return;
      }

      setMessage('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  }

  // Step 2: reset password
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Failed to reset password');
        return;
      }

      setMessage('Password reset successful! You can now log in.');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      {step === 1 && (
        <form onSubmit={requestOtp}>
          <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <label className="block mb-4">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </label>
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetPassword}>
          <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <label className="block mb-2">
            OTP
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </label>

          <label className="block mb-4">
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </label>

          <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}
