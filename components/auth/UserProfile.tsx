'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { authService } from '@/lib/auth/authService';
import { LogOut, User } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        )}
        <span className="text-white text-sm hidden md:block">
          {user.displayName || user.email}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl z-[101] overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <p className="text-white font-medium">{user.displayName || 'User'}</p>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-white hover:bg-red-600/20 hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
