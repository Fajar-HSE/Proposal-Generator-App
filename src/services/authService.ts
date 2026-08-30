// src/services/authService.ts
import { AppError } from '../types';
import type { CurrentUser, FirebaseAuthUser } from '../types';

declare global { interface Window { firebase?: any } }

const firebaseConfig = {
  apiKey: "AIzaSyCe9rZzhE5t6bUgZTURiI6x2Y2ZvBlt_co",
  authDomain: "proposal-generator-c6bc8.firebaseapp.com",
  projectId: "proposal-generator-c6bc8",
  storageBucket: "proposal-generator-c6bc8.firebasestorage.app",
  messagingSenderId: "805030576451",
  appId: "1:805030576451:web:906302f39cae18f5736ff6"
};

function getAuth(): any {
  const fb = window.firebase;
  if (!fb) throw new AppError('Firebase belum termuat', 'internal', 'FIREBASE');
  if (!fb.apps.length) fb.initializeApp(firebaseConfig);
  const auth = fb.auth();
  auth.setPersistence(fb.auth.Auth.Persistence.LOCAL);
  return auth;
}
function mapErr(code: string): AppError {
  const m: Record<string,string> = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-not-found': 'Email belum terdaftar.',
    'auth/wrong-password': 'Kata sandi salah.',
    'auth/invalid-credential': 'Email atau sandi salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/weak-password': 'Kata sandi minimal 6 karakter.',
    'auth/too-many-requests': 'Terlalu banyak percobaan.',
    'auth/popup-closed-by-user': 'Popup ditutup.',
    'auth/network-request-failed': 'Koneksi bermasalah.',
  };
  return new AppError(m[code] || `Error: ${code}`, 'authentication', code);
}
export function userFromFirebase(fb: FirebaseAuthUser | null): CurrentUser | null {
  if (!fb) return null;
  const email = fb.email || '';
  const name = fb.displayName || fb.providerData?.[0]?.displayName || (email ? email.split('@')[0] : '');
  return { uid: fb.uid, name, email, photoURL: fb.photoURL || null, provider: fb.providerData?.[0]?.providerId || 'firebase' };
}
export async function signInWithEmail(email: string, password: string): Promise<CurrentUser> {
  try { const r = await getAuth().signInWithEmailAndPassword(email, password); return userFromFirebase(r.user)!; }
  catch (e: any) { throw mapErr(e.code || 'unknown'); }
}
export async function registerWithEmail(email: string, password: string, displayName?: string): Promise<CurrentUser> {
  if (password.length < 6) throw new AppError('Minimal 6 karakter', 'validation', 'WEAK');
  try {
    const r = await getAuth().createUserWithEmailAndPassword(email, password);
    if (displayName) await r.user.updateProfile({ displayName });
    return userFromFirebase(r.user)!;
  } catch (e: any) { throw mapErr(e.code || 'unknown'); }
}
export async function signInWithGoogle(): Promise<CurrentUser> {
  try {
    const auth = getAuth();
    const p = new auth.constructor.GoogleAuthProvider ? new window.firebase.auth.GoogleAuthProvider() : new window.firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    const r = await auth.signInWithPopup(p);
    return userFromFirebase(r.user)!;
  } catch (e: any) { throw mapErr(e.code || 'unknown'); }
}
export async function signOut(): Promise<void> { try { await getAuth().signOut(); } catch {} }
export function onAuthStateChanged(cb: (u: CurrentUser | null) => void): () => void {
  return getAuth().onAuthStateChanged((fb: FirebaseAuthUser | null) => cb(userFromFirebase(fb)));
}
