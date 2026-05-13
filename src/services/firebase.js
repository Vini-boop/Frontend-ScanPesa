// firebase.js — Firebase client SDK (optional — polling works without it)
// If Firebase is not configured, db will be null and WaitingPage falls back to polling.

let db = null;

try {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId && !apiKey.startsWith("YOUR_")) {
    const { initializeApp } = await import("firebase/app");
    const { getFirestore } = await import("firebase/firestore");

    const app = initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });

    db = getFirestore(app);
  }
} catch (_) {
  // Firebase not available — polling handles status updates
}

export { db };
