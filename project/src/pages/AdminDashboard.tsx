import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, collections } from '../lib/firebase';
import { Plus, Upload, QrCode, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface Artwork {
  id: string;
  title: string;
  type: string;
  student_name: string;
  created_at: string;
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsRef = collection(db, collections.students);
        const artworksRef = collection(db, collections.artworks);
        const artworksQuery = query(artworksRef, orderBy('created_at', 'desc'));

        const [studentsSnapshot, artworksSnapshot] = await Promise.all([
          getDocs(studentsRef),
          getDocs(artworksQuery)
        ]);

        setStudents(
          studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Student[]
        );

        setArtworks(
          artworksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Artwork[]
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredArtworks = artworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
            Add Student
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Upload className="w-5 h-5" />
            Upload Artwork
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500">
                    <th className="pb-4">Title</th>
                    <th className="pb-4">Student</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArtworks.map((artwork) => (
                    <tr key={artwork.id}>
                      <td className="py-4">{artwork.title}</td>
                      <td>{artwork.student_name}</td>
                      <td className="capitalize">{artwork.type}</td>
                      <td>{new Date(artwork.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="text-indigo-600 hover:text-indigo-800">
                          <QrCode className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Students</h2>
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">Grade {student.grade}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}