# How the Authentication Works

## Flow

### 1. First Visit (Not Logged In)
- You open http://localhost:3000
- App checks if you're logged in
- **You're redirected to `/login` page**
- Beautiful login page with MusePilot branding appears

### 2. Login Page
You'll see:
- **Left side**: MusePilot branding and features
- **Right side**: Login form with:
  - Email and password fields
  - "Sign In" button
  - "Continue with Google" button
  - "Forgot password?" link
  - "Sign up" link at the bottom

### 3. Create Account (First Time)
1. Click "Sign up" at the bottom of the login form
2. Enter your name, email, and password
3. Click "Sign Up"
4. **Automatically redirected to main app**

### 4. Sign In (Returning User)
1. Enter your email and password
2. Click "Sign In"
3. **Automatically redirected to main app**

### 5. Inside the App (Logged In)
- You see the full MusePilot interface
- **Top-right corner**: Your profile picture/name
- Click your profile → Dropdown menu appears
- Click **"Sign Out"** to log out

### 6. After Sign Out
- **Automatically redirected back to `/login` page**
- Must sign in again to access the app

## Routes

- `/login` - Login/Signup page (public)
- `/` - Main app (protected, requires authentication)

## Sign Out Location

The **Sign Out** button is in the **UserProfile dropdown** in the top-right corner:
1. Click your profile picture/name
2. Dropdown menu opens
3. Click "Sign Out"
4. You're logged out and redirected to login page

## Testing

1. Make sure Firebase credentials are in `.env.local`
2. Restart dev server: `npm run dev`
3. Open http://localhost:3000
4. You should see the **login page** immediately
5. Create an account or sign in
6. You'll be taken to the main app
7. Click your profile in top-right to sign out
