import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';

const firebaseConfig = {
  apiKey: "AIzaSyAUJVd-jS4r1xc8Y9dRLZO3yy0_E5PcVBQ",
  authDomain: "qrmollebakken.firebaseapp.com",
  projectId: "qrmollebakken",
  storageBucket: "qrmollebakken.appspot.com",
  messagingSenderId: "242699405359",
  appId: "1:242699405359:web:47c9eb2c13cfaa182fdeda",
  measurementId: "G-QMS8DBR2NN"
};

// Collection names
export const collections = {
  artworks: 'artworks',
  users: 'users',
  students: 'students',
  parentAuth: 'parent_auth_tokens'
} as const;

// Initialize Firebase
let app;
let db;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  toast.error('Failed to initialize application. Please refresh and try again.');
  throw error;
}

export { db, auth, storage };