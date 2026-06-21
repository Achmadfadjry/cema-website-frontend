import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// getDatabase() is NOT called here at module scope. Calling it eagerly means
// it runs the instant anything imports this file -- including during Next.js
// server-side prerendering, where there's no `window` and the Realtime
// Database client SDK isn't meant to run. That's what was throwing the
// "Cannot parse Firebase url" fatal error on /login.
//
// Instead, db/database are lazily initialized on first access, and only
// ever actually called in the browser.
let _db: Database | undefined;

function getDb(): Database {
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase Realtime Database was accessed during server-side rendering. " +
        "It should only be used in client components / browser code.",
    );
  }
  if (!_db) {
    _db = getDatabase(app);
  }
  return _db;
}

// Preserves the original named exports (`db`, `database`) so existing
// imports elsewhere in the app don't need to change -- but now they're
// lazy getters instead of eagerly-evaluated values.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export const database = db;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
