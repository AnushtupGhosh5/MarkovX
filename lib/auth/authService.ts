import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export interface AuthError {
  code: string;
  message: string;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Handle auth errors
  handleAuthError(error: any): AuthError {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
    };

    return {
      code: error.code || 'auth/unknown',
      message: errorMessages[error.code] || error.message || 'An error occurred during authentication'
    };
  }
};
