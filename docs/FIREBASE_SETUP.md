# Firebase Authentication Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Authentication Methods

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", add your project support email, and save

## 3. Register Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "MusePilot Web")
5. Copy the Firebase configuration object

## 4. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the Firebase placeholder values with your actual credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

## 5. Configure Authorized Domains (for Production)

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)
3. `localhost` is already authorized for development

## 6. Usage in Your App

### Wrap your app with AuthProvider

The AuthProvider is already set up in `app/layout.tsx`. It provides authentication state throughout your app.

### Use the useAuth hook

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.displayName}!</div>;
}
```

### Show login/signup modal

```tsx
import { AuthModal } from '@/components/auth/AuthModal';

function MyComponent() {
  const [showAuth, setShowAuth] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowAuth(true)}>Sign In</button>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
```

### Protect routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content requires authentication</div>
    </ProtectedRoute>
  );
}
```

### Show user profile

```tsx
import { UserProfile } from '@/components/auth/UserProfile';

function Header() {
  return (
    <header>
      <UserProfile />
    </header>
  );
}
```

## 7. Available Auth Methods

### Sign Up
```tsx
import { authService } from '@/lib/auth/authService';

await authService.signUp(email, password, displayName);
```

### Sign In
```tsx
await authService.signIn(email, password);
```

### Sign In with Google
```tsx
await authService.signInWithGoogle();
```

### Sign Out
```tsx
await authService.signOut();
```

### Reset Password
```tsx
await authService.resetPassword(email);
```

### Get Current User
```tsx
const user = authService.getCurrentUser();
```

## 8. Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Firebase Security Rules** - Configure Firestore/Storage rules in Firebase Console
3. **Enable App Check** (optional) - Protects your backend from abuse
4. **Monitor Authentication** - Check Firebase Console for suspicious activity
5. **Set up email verification** (optional) - Add email verification for new users

## 9. Testing

1. Start your development server: `npm run dev`
2. Click the sign-in button in your app
3. Try creating a new account with email/password
4. Try signing in with Google
5. Test password reset functionality
6. Verify sign out works correctly

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart your development server after changing `.env.local`

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console
- For localhost, it should work by default

### Google Sign-In popup closes immediately
- Check that Google provider is enabled in Firebase Console
- Verify your OAuth consent screen is configured

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Firebase package should already be in package.json

## Next Steps

- Add email verification for new users
- Implement user profile management
- Add social login providers (GitHub, Twitter, etc.)
- Set up Firebase Firestore for user data storage
- Configure Firebase Security Rules
