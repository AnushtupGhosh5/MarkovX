'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import MainLayout from '@/components/MainLayout';
import LoginPage from '@/components/LoginPage';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return <MainLayout />;
}
