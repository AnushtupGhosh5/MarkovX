# Quick Start - Firebase Authentication

## What You'll See

### 1. Sign In Button
When you're **not logged in**, you'll see a blue **"Sign In"** button in the top-right corner of your app header.

### 2. Click Sign In
Clicking the button opens a modal (popup) with:
- Email and password fields
- "Sign In" button
- "Continue with Google" button
- "Forgot password?" link
- "Sign up" link to create a new account

### 3. After Login
Once logged in, the "Sign In" button is replaced with your **user profile**:
- Shows your profile picture (or a default icon)
- Shows your name/email
- Click it to see a dropdown with "Sign Out" option

## How to Test Right Now

1. **Make sure your Firebase credentials are in `.env.local`**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

2. **Restart your dev server** (important!)
   ```bash
   npm run dev
   ```

3. **Open your app** at http://localhost:3000

4. **Look for the "Sign In" button** in the top-right corner

5. **Click it** - the login modal will appear!

## What You Can Do

### Create a New Account
1. Click "Sign In" button
2. Click "Sign up" at the bottom
3. Enter your name, email, and password
4. Click "Sign Up"

### Sign In with Email
1. Click "Sign In" button
2. Enter your email and password
3. Click "Sign In"

### Sign In with Google
1. Click "Sign In" button
2. Click "Continue with Google"
3. Choose your Google account

### Reset Password
1. Click "Sign In" button
2. Click "Forgot password?"
3. Enter your email
4. Check your email for reset link

### Sign Out
1. Click your profile picture/name in top-right
2. Click "Sign Out"

## Troubleshooting

### "Sign In button doesn't appear"
- Make sure you restarted the dev server after adding Firebase credentials
- Check browser console for errors (F12)

### "Firebase configuration error"
- Double-check all Firebase credentials in `.env.local`
- Make sure they start with `NEXT_PUBLIC_`
- No quotes needed around the values

### "Google sign-in doesn't work"
- Enable Google provider in Firebase Console
- Go to Authentication → Sign-in method → Google → Enable

### "Can't create account"
- Enable Email/Password in Firebase Console
- Go to Authentication → Sign-in method → Email/Password → Enable

## Where is the Login Page?

**There is no separate login page!** The authentication uses a **modal** (popup overlay) that appears on top of your current page. This is a better UX because:
- Users don't lose their place
- No page navigation needed
- Works on any page
- Modern, clean design

The modal appears when you click the "Sign In" button in the header.
