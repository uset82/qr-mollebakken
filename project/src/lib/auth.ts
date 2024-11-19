import { auth, db, collections } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, limit, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export async function signInWithQR(qrData: string) {
  try {
    const [prefix, type, parentId] = qrData.split(':');
    
    if (prefix !== 'mollebakken' || type !== 'parent') {
      throw new Error('Invalid QR code format');
    }

    // Verify parent token exists
    const q = query(
      collection(db, collections.parentAuth),
      where('parent_id', '==', parentId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Invalid parent ID');
    }

    const tokenDoc = snapshot.docs[0];
    const { token } = tokenDoc.data();
    const email = `parent-${parentId}@mollebakken.internal`;

    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, email, token);
    } catch (error: any) {
      // If user doesn't exist, create a new account
      if (error.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, token);
        
        // Create user profile
        await setDoc(doc(db, collections.users, userCredential.user.uid), {
          email,
          role: 'parent',
          parent_id: parentId,
          created_at: serverTimestamp()
        });
      } else {
        throw error;
      }
    }
    
    toast.success('Welcome to ArtConnect!');
  } catch (error: any) {
    console.error('QR login error:', error);
    
    if (error.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Invalid QR code. Please try again.');
    }
    
    throw error;
  }
}