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
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-colors"
        title={user.displayName || user.email || 'User'}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User size={18} className="text-white" />
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-black/40 backdrop-blur-xl rounded-md border border-white/10 z-[101] overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="text-white text-sm font-medium">{user.displayName || 'User'}</p>
              <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
