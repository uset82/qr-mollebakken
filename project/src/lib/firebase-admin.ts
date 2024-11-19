import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for server-side operations)
const app = initializeApp({
  credential: cert({
    projectId: "qrmollebakken",
    clientEmail: "firebase-adminsdk-xxxxx@qrmollebakken.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const adminDb = getFirestore(app);
export const collections = {
  artworks: 'artworks',
  users: 'users',
  students: 'students',
  parentAuth: 'parent_auth_tokens'
} as const;