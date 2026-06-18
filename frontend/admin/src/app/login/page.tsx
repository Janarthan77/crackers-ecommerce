'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Cookies.set('admin-token', data.token, { expires: 1 });
        toast.success('Login successful!');
        router.push('/');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0] p-4 relative overflow-hidden w-full">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-[#E8192C] to-[#FF6B00] opacity-10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] opacity-10 blur-3xl" />

      <div className="stat-card w-full max-w-md p-8 z-10">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://pub-c9de055708fa4822887d1db91f66e351.r2.dev/brand_logo.png"
            alt="Rupika Crackers Logo"
            className="w-16 h-16 object-contain mb-4 select-none"
          />
          <h1 className="page-title !mb-1 text-center">Welcome Back</h1>
          <p className="text-sm text-center" style={{ color: 'var(--text-m)' }}>
            Sign in to Rupika Crackers Admin Panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-b)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="admin-input w-full p-3 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/30 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-b)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="admin-input w-full p-3 rounded-xl focus:ring-2 focus:ring-[#FF6B00]/30 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full p-3.5 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E8192C, #FF6B00)', boxShadow: '0 4px 15px rgba(232, 25, 44, 0.2)' }}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
