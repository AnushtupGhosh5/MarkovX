# Authentication Usage Examples

## Quick Start Examples

### 1. Add Sign In Button to Your Page

```tsx
'use client';

import { useState } from 'react';
import { AuthModal } from '@/components/auth';
import { useAuth } from '@/lib/auth/AuthContext';

export default function MyPage() {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  return (
    <div>
      {user ? (
        <p>Welcome, {user.displayName || user.email}!</p>
      ) : (
        <button onClick={() => setShowAuth(true)}>
          Sign In
        </button>
      )}
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}
```

### 2. Add User Profile to Header

```tsx
import { UserProfile } from '@/components/auth';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>My App</h1>
      <UserProfile />
    </header>
  );
}
```

### 3. Protect a Page (Require Authentication)

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>This content is only visible to authenticated users</p>
      </div>
    </ProtectedRoute>
  );
}
```

### 4. Check Auth State in Component

```tsx
'use client';

import { useAuth } from '@/lib/auth/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div>
      <h2>Hello, {user.displayName}!</h2>
      <p>Email: {user.email}</p>
      <p>User ID: {user.uid}</p>
    </div>
  );
}
```

### 5. Programmatic Authentication

```tsx
'use client';

import { authService } from '@/lib/auth/authService';
import { useState } from 'react';

export default function CustomAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await authService.signIn(email, password);
      alert('Signed in successfully!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await authService.signUp(email, password, 'My Name');
      alert('Account created!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
      alert('Signed in with Google!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleGoogleSignIn}>Google Sign In</button>
    </div>
  );
}
```

### 6. Conditional Rendering Based on Auth

```tsx
'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { AuthModal } from '@/components/auth';
import { useState } from 'react';

export default function ConditionalContent() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div>
      {user ? (
        <div>
          <h2>Premium Content</h2>
          <p>Thanks for being a member, {user.displayName}!</p>
        </div>
      ) : (
        <div>
          <h2>Sign in to access premium content</h2>
          <button onClick={() => setShowAuth(true)}>
            Get Access
          </button>
        </div>
      )}
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}
```

### 7. Server-Side Auth Check (API Route)

```tsx
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the Firebase ID token from the Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  // Verify the token with Firebase Admin SDK
  // (You'll need to set up Firebase Admin SDK for this)
  
  return NextResponse.json({ message: 'Protected data' });
}
```

### 8. Sign Out Button

```tsx
'use client';

import { authService } from '@/lib/auth/authService';

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      alert('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
```

## Integration with Existing App

To integrate authentication into your existing MusePilot app:

1. **Add auth button to MainLayout.tsx**:
```tsx
import { UserProfile } from '@/components/auth';

// Add to your header/navigation
<UserProfile />
```

2. **Protect the main app page**:
```tsx
import { ProtectedRoute } from '@/components/auth';

export default function Home() {
  return (
    <ProtectedRoute>
      {/* Your existing app content */}
    </ProtectedRoute>
  );
}
```

3. **Show user info in the app**:
```tsx
import { useAuth } from '@/lib/auth/AuthContext';

const { user } = useAuth();
// Use user.displayName, user.email, user.photoURL, etc.
```
