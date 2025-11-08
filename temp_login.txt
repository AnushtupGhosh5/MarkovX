'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        if (userCredential.user && formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          });
        }
      }
    } catch (err: any) {
      let errorMessage = 'Authentication failed';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      let errorMessage = 'Google authentication failed';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated Musical Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Musical Notes - More of them! */}
        <div className="absolute top-20 left-10 text-cyan-500/15 text-6xl animate-float" style={{ animationDelay: '0s' }}>♪</div>
        <div className="absolute top-40 right-20 text-blue-500/15 text-8xl animate-float" style={{ animationDelay: '2s' }}>♫</div>
        <div className="absolute bottom-32 left-1/4 text-cyan-400/15 text-7xl animate-float" style={{ animationDelay: '4s' }}>♪</div>
        <div className="absolute top-1/3 right-1/4 text-blue-400/15 text-5xl animate-float" style={{ animationDelay: '1s' }}>♫</div>
        <div className="absolute bottom-20 right-10 text-cyan-500/15 text-6xl animate-float" style={{ animationDelay: '3s' }}>♪</div>
        <div className="absolute top-60 left-1/2 text-blue-500/15 text-7xl animate-float-reverse" style={{ animationDelay: '1.5s' }}>♫</div>
        <div className="absolute bottom-40 left-20 text-cyan-400/15 text-5xl animate-float-reverse" style={{ animationDelay: '2.5s' }}>♪</div>
        <div className="absolute top-1/2 right-1/3 text-blue-500/15 text-6xl animate-float" style={{ animationDelay: '3.5s' }}>♫</div>
        <div className="absolute bottom-60 right-1/4 text-cyan-500/15 text-8xl animate-float-reverse" style={{ animationDelay: '0.5s' }}>♪</div>
        <div className="absolute top-32 left-1/3 text-blue-400/15 text-5xl animate-float" style={{ animationDelay: '4.5s' }}>♫</div>
        
        {/* Treble Clefs - Rotating */}
        <div className="absolute top-1/4 left-1/3 text-blue-500/12 text-9xl animate-float-rotate" style={{ animationDelay: '1.5s' }}>𝄞</div>
        <div className="absolute bottom-1/4 right-1/3 text-cyan-500/12 text-9xl animate-float-rotate-reverse" style={{ animationDelay: '3.5s' }}>𝄞</div>
        <div className="absolute top-1/2 left-10 text-blue-400/10 text-7xl animate-float-rotate" style={{ animationDelay: '2s' }}>𝄞</div>
        <div className="absolute bottom-1/3 right-20 text-cyan-400/10 text-7xl animate-float-rotate-reverse" style={{ animationDelay: '4s' }}>𝄞</div>
        
        {/* Bass Clefs */}
        <div className="absolute top-1/3 right-10 text-cyan-500/12 text-8xl animate-float-rotate" style={{ animationDelay: '2.5s' }}>𝄢</div>
        <div className="absolute bottom-1/2 left-1/4 text-blue-500/12 text-8xl animate-float-rotate-reverse" style={{ animationDelay: '1s' }}>𝄢</div>
        
        {/* Sound Waves - Animated */}
        <svg className="absolute top-10 right-1/3 w-40 h-40 text-cyan-500/15 animate-wave" viewBox="0 0 100 100">
          <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,50 Q30,70 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,50 Q30,40 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        </svg>
        <svg className="absolute bottom-10 left-1/3 w-40 h-40 text-blue-500/15 animate-wave" viewBox="0 0 100 100" style={{ animationDelay: '2s' }}>
          <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,50 Q30,70 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,50 Q30,60 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        </svg>
        <svg className="absolute top-1/2 left-1/2 w-32 h-32 text-cyan-400/15 animate-wave" viewBox="0 0 100 100" style={{ animationDelay: '1s' }}>
          <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M10,50 Q30,70 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
        
        {/* Music Staff Lines - Animated */}
        <div className="absolute top-1/4 left-0 w-full opacity-10">
          <div className="relative h-32">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-staff-line" style={{ top: `${i * 25}%`, animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-1/4 left-0 w-full opacity-10">
          <div className="relative h-32">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-staff-line" style={{ top: `${i * 25}%`, animationDelay: `${i * 0.2 + 2}s` }}></div>
            ))}
          </div>
        </div>
        
        {/* Vinyl Records - Spinning */}
        <div className="absolute top-20 right-1/4 w-24 h-24 rounded-full border-4 border-cyan-500/10 animate-spin-slow">
          <div className="absolute inset-4 rounded-full border-2 border-cyan-500/10"></div>
          <div className="absolute inset-8 rounded-full bg-cyan-500/10"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full border-4 border-blue-500/10 animate-spin-slow" style={{ animationDelay: '2s' }}>
          <div className="absolute inset-4 rounded-full border-2 border-blue-500/10"></div>
          <div className="absolute inset-8 rounded-full bg-blue-500/10"></div>
        </div>
        
        {/* Equalizer Bars - Bouncing */}
        <div className="absolute top-1/3 left-20 flex gap-1 items-end h-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-2 bg-gradient-to-t from-cyan-500/20 to-cyan-400/20 rounded-t animate-equalizer" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
        <div className="absolute bottom-1/3 right-20 flex gap-1 items-end h-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-2 bg-gradient-to-t from-blue-500/20 to-blue-400/20 rounded-t animate-equalizer" style={{ animationDelay: `${i * 0.1 + 0.5}s` }}></div>
          ))}
        </div>
        
        {/* Piano Keys Pattern - Animated */}
        <div className="absolute top-0 left-0 w-full h-3 flex opacity-10">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 7 === 1 || i % 7 === 3 || i % 7 === 6 ? 'bg-slate-900' : 'bg-cyan-400'} animate-piano-key`} style={{ animationDelay: `${i * 0.05}s` }}></div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-3 flex opacity-10">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 7 === 1 || i % 7 === 3 || i % 7 === 6 ? 'bg-slate-900' : 'bg-blue-400'} animate-piano-key`} style={{ animationDelay: `${i * 0.05 + 1}s` }}></div>
          ))}
        </div>
        
        {/* Circular Glow Effects - Pulsing */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-cyan-500/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">MusePilot</h1>
          <p className="text-cyan-300/70 text-sm">AI-Powered Music Production</p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-cyan-300/90 mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/60 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-cyan-300/90 mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/60 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-cyan-300/90 mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/60 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cyan-500/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900/60 text-cyan-300/60">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-cyan-300/60 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
