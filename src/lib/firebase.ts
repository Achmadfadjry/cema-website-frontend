import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

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

// Neither getDatabase() nor getAuth() are called here at module scope.
// Calling them eagerly means they run the instant anything imports this
// file -- including during Next.js server-side prerendering, where there's
// no `window` and the client SDKs aren't meant to run. That's what was
// throwing "Cannot parse Firebase url" (database) and then
// "auth/invalid-api-key" (auth) during prerendering of /login and
// /dashboard/client/chat.
//
// Instead, both are lazily initialized on first access, and only ever
// actually called in the browser.

function assertClientSide(serviceName: string): void {
  if (typeof window === "undefined") {
    throw new Error(
      `Firebase ${serviceName} was accessed during server-side rendering. ` +
        "It should only be used in client components / browser code " +
        "(e.g. inside useEffect, event handlers, or 'use client' components).",
    );
  }
}

let _db: Database | undefined;

function getDb(): Database {
  assertClientSide("Realtime Database");
  if (!_db) {
    _db = getDatabase(app);
  }
  return _db;
}

let _auth: Auth | undefined;

function getFirebaseAuth(): Auth {
  assertClientSide("Auth");
  if (!_auth) {
    _auth = getAuth(app);
  }
  return _auth;
}

// Proxies preserve the original named exports (`db`, `database`, `auth`) so
// existing imports elsewhere in the app don't need to change -- but now
// they're lazy getters instead of eagerly-evaluated values.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export const database = db;

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
});

export const googleProvider = new GoogleAuthProvider();

export default app;
