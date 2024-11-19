import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  startAfter,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, collections } from './firebase';
import { students } from './students';
import toast from 'react-hot-toast';

export interface Artwork {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  created_at: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  description?: string;
}

const ARTWORKS_PER_PAGE = 12;

export async function getArtwork(id: string): Promise<Artwork> {
  try {
    const docRef = doc(db, collections.artworks, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Artwork not found');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      created_at: (docSnap.data().created_at as Timestamp).toDate().toISOString()
    } as Artwork;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    toast.error('Failed to load artwork');
    throw error;
  }
}

export async function getStudentArtworks(studentId: string, lastDoc?: DocumentSnapshot) {
  try {
    const artworksRef = collection(db, collections.artworks);
    let q = query(
      artworksRef,
      where('student_id', '==', studentId),
      orderBy('created_at', 'desc'),
      limit(ARTWORKS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    return {
      artworks: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: (doc.data().created_at as Timestamp).toDate().toISOString()
      })) as Artwork[],
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === ARTWORKS_PER_PAGE
    };
  } catch (error) {
    console.error('Error fetching student artworks:', error);
    toast.error('Failed to load student artworks');
    throw error;
  }
}

export async function getParentArtworks(parentId: string, lastDoc?: DocumentSnapshot) {
  try {
    const artworksRef = collection(db, collections.artworks);
    let q = query(
      artworksRef,
      where('parent_id', '==', parentId),
      orderBy('created_at', 'desc'),
      limit(ARTWORKS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    return {
      artworks: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: (doc.data().created_at as Timestamp).toDate().toISOString()
      })) as Artwork[],
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === ARTWORKS_PER_PAGE
    };
  } catch (error) {
    console.error('Error fetching parent artworks:', error);
    toast.error('Failed to load parent artworks');
    throw error;
  }
}

export async function createArtwork(data: Omit<Artwork, 'id' | 'created_at'>) {
  try {
    const student = students.find(s => s.id === data.student_id);
    if (!student) {
      throw new Error('Student not found');
    }

    const artworkData = {
      ...data,
      student_name: student.name,
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, collections.artworks), artworkData);
    toast.success('Artwork created successfully');
    return docRef.id;
  } catch (error) {
    console.error('Error creating artwork:', error);
    toast.error('Failed to create artwork');
    throw error;
  }
}

export async function updateArtwork(id: string, data: Partial<Omit<Artwork, 'id' | 'created_at'>>) {
  try {
    const docRef = doc(db, collections.artworks, id);
    await updateDoc(docRef, data);
    toast.success('Artwork updated successfully');
  } catch (error) {
    console.error('Error updating artwork:', error);
    toast.error('Failed to update artwork');
    throw error;
  }
}

export async function getAllArtworks(lastDoc?: DocumentSnapshot) {
  try {
    const artworksRef = collection(db, collections.artworks);
    let q = query(
      artworksRef,
      orderBy('created_at', 'desc'),
      limit(ARTWORKS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    return {
      artworks: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: (doc.data().created_at as Timestamp).toDate().toISOString()
      })) as Artwork[],
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === ARTWORKS_PER_PAGE
    };
  } catch (error) {
    console.error('Error fetching all artworks:', error);
    toast.error('Failed to load artworks');
    throw error;
  }
}