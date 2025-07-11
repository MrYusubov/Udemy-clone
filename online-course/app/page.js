'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Plus, X, ArrowRight, Clock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [courseRes, categoryRes, userRes] = await Promise.all([
          fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const courseData = await courseRes.json();
        const categoryData = await categoryRes.json();
        const userData = await userRes.json();

        setCourses(courseData.courses || []);
        setCategories(categoryData.categories || []);
        setIsAdmin(userData?.user?.isAdmin || false);
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const filteredCourses = courses.filter((course) => {
    const categoryMatch = selectedCategory ? course.category.id === parseInt(selectedCategory) : true;
    const levelMatch = selectedLevel ? course.level === selectedLevel : true;
    return categoryMatch && levelMatch;
  });

  const handleAddCategory = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });

    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data.category]);
      setShowCategoryModal(false);
      setNewCategory('');
    } else {
      console.error('Category creation failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>

            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === '' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id.toString() ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={
                          course.image
                            ? `https://res.cloudinary.com/djosldcjf/image/upload/c_fill,w_600,h_400/${course.image}`
                            : '/placeholder.png'
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="text-xs bg-white text-gray-800 px-2 py-1 rounded-full font-medium">
                          {course.category.name}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                        <span className="text-sm font-semibold text-indigo-600 whitespace-nowrap ml-2">
                          ${course.price}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.duration || '0h 00m'}
                        </div>
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        >
                          View Course <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">
                  {selectedCategory || selectedLevel 
                    ? "Try changing your filters" 
                    : "There are currently no courses available"}
                </p>
                {(selectedCategory || selectedLevel) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedLevel('');
                    }}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                disabled={!newCategory.trim()}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}