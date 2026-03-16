# Firebase Auth Setup Guide

## Overview

This app now has unified login/signup with Firebase Authentication using Google and Facebook as OAuth providers. The app is fully protected - only logged-in users can access the main app.

## File Structure

- `app/lib/firebase.ts` - Firebase initialization with auth export
- `app/lib/AuthContext.tsx` - React context for auth state management
- `app/lib/ProtectedRoute.tsx` - Component to protect pages requiring authentication
- `app/login/page.tsx` - Login/signup page with Google and Facebook buttons
- `app/layout.tsx` - Updated root layout with AuthProvider wrapper
- `app/page.tsx` - Updated main page with auth protection and sign-out button

## Firebase Console Setup

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "her-mate" project
3. Navigate to **Authentication** → **Sign-in method**
4. Click **Google**
5. Toggle **Enable** and save

### 2. Enable Facebook Sign-In

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Facebook**
3. Toggle **Enable**
4. You'll need:
   - **Facebook App ID**
   - **Facebook App Secret**

   #### Get Facebook Credentials:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create/login to your app
   - Navigate to **Settings** → **Basic**
   - Copy your **App ID** and **App Secret**
   - Go to **Products** and add **Facebook Login**
   - In Facebook Login settings, add your Firebase domain to **Valid OAuth Redirect URIs**:
     - Format: `https://her-mate.firebaseapp.com/__/auth/handler`

5. Paste the App ID and Secret into Firebase Console
6. Save

### 3. Configure Authorized Domains (Optional but Recommended)

1. Go to **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your domain(s):
   - `localhost:3000` (for local development)
   - `her-mate.firebaseapp.com` (for production)
   - Your custom domain if you have one

## Auth Flow

### User Journey

1. Unauthenticated user visits `http://localhost:3000`
2. `ProtectedRoute` redirects to `/login`
3. User clicks "Continue with Google" or "Continue with Facebook"
4. OAuth provider popup appears
5. User authenticates with their account
6. Firebase creates/links user account
7. User is redirected to home page
8. Auth state is persisted in Firebase session

### Sign Out

- Click the sign-out button (↪️) in the top-right corner
- User is redirected to login page
- Session is cleared

## Key Features

✅ **OAuth 2.0 Integration** - Secure third-party authentication  
✅ **Persistent Auth** - Sessions persist across page reloads  
✅ **Protected Routes** - Automatic redirection for unauthenticated users  
✅ **Auth Context** - Global auth state via React Context  
✅ **Sign Out** - Clean session clearing  
✅ **User Data** - Access to user email, display name, photo URL, etc.

## Accessing User Data

In any component within `AuthProvider`:

```typescript
import { useAuth } from "@/app/lib/AuthContext";

export function MyComponent() {
  const { user } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {user?.displayName}</p>
      <img src={user?.photoURL} alt="Avatar" />
    </div>
  );
}
```

## Testing Locally

1. Run development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click login button
4. Authenticate with Google or Facebook
5. You should be redirected to the home page

## Production Deployment

When deploying to production:

1. Update your domain in Firebase Authorized Domains
2. Ensure Google and Facebook OAuth apps have your production domain configured
3. Update environment variables if needed
4. Test the authentication flow before going live

## Troubleshooting

### "Auth Domain not configured"

- Make sure you added your domain to Firebase Authorized Domains

### "Invalid redirect URI"

- Check Facebook app settings for correct redirect URI
- Make sure it matches Firebase's expected format

### PopUp blocked

- Browser popup blockers may block OAuth popups
- Users may need to allow popups for your domain

### User data not available

- Make sure you're accessing `user` inside a component wrapped by `ProtectedRoute`
- Check browser console for any Firebase errors
