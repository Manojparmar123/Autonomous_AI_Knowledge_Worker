'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '../src/components/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- Initialize Firebase safely (avoid re-init in hot reload) ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Email/password login
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      saveAuth(data.access_token, data.role);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  }

  // Firebase login (Google)
  async function firebaseLogin() {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send Firebase token to backend to get JWT
      const res = await fetch('http://localhost:8000/auth/login/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) throw new Error('Firebase login failed');
      const data = await res.json();
      saveAuth(data.access_token, data.role);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Google login failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-sm mb-4">
        <h2 className="text-xl font-bold mb-4">Sign in</h2>

        <label className="block text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          type="email"
          required
        />

        <label className="block text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Sign in
        </button>
      </form>

      <button
        onClick={firebaseLogin}
        className="bg-red-600 text-white p-2 rounded w-full max-w-sm"
      >
        Sign in with Google
      </button>
    </div>
  );
}
