import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDjj4Gu-my6wo2rDuDY9x_RM7_G5616F3U',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'myapp-8fb3f.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'myapp-8fb3f',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'myapp-8fb3f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '674164624386',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:674164624386:web:ca229fd4d6fc4291b32b1b',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
