'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AddCoursePage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: null,
        imagePreview: '',
        duration: '',
        price: '',
        categoryId: '',
    });
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/auth/login');

        fetch('/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setCategories(data.categories))
            .catch(() => setError('Failed to load categories.'));
    }, [router]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files[0]) {
            setForm({ ...form, image: files[0], imagePreview: URL.createObjectURL(files[0]) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleTopicChange = (index, key, value) => {
        const updated = [...topics];
        updated[index][key] = value;
        setTopics(updated);
    };

    const handleTopicFileChange = (index, file) => {
        const updated = [...topics];
        updated[index].video = file;
        setTopics(updated);
    };

    const addTopic = () => {
        setTopics([...topics, { title: '', video: null }]);
    };

    const removeTopic = (index) => {
        const updated = [...topics];
        updated.splice(index, 1);
        setTopics(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Authentication required');
            setLoading(false);
            return router.push('/auth/login');
          }
      
          const formData = new FormData();
          formData.append('title', form.title);
          formData.append('description', form.description);
          if (form.image) formData.append('image', form.image);
          formData.append('duration', form.duration);
          formData.append('price', form.price);
          formData.append('categoryId', form.categoryId);
      
          topics.forEach((topic, idx) => {
            formData.append(`topics[${idx}][title]`, topic.title);
            if (topic.video) formData.append(`topics[${idx}][video]`, topic.video);
          });
      
          const res = await fetch('/api/admin/courses', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
      
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to create course');
          }
      
          router.push('/');
        } catch (err) {
          console.error('Submission error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };


    return (
        <div className="min-h-screen bg-gray-100 py-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800"> Add New Course</h1>

                    {error && <p className="text-red-600 mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g., Next.js Bootcamp"
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="This course will teach you Next.js..."
                                rows={4}
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Course Cover Image</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Duration</label>
                            <input
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                placeholder="e.g., 3h 20m"
                                className="w-full p-3 border rounded-lg shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Price</label>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="Course price"
                                className="w-full p-3 border rounded-lg"
                            />

                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Category</label>
                            <select
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded-lg shadow-sm"
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-700"> Topics</h2>
                            {topics.map((topic, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <span className="text-sm w-5">{index + 1}.</span>
                                    <input
                                        type="text"
                                        placeholder="Topic title"
                                        value={topic.title}
                                        onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                                        className="flex-1 p-2 border rounded"
                                    />
                                    <label className="cursor-pointer">
                                        <UploadCloud className="w-5 h-5 text-blue-600" />
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleTopicFileChange(index, e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                    <button type="button" onClick={() => removeTopic(index)}>
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addTopic} className="text-blue-600 underline text-sm">+ Add Topic</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg shadow-md transition"
                        >
                            {loading ? 'Submitting...' : 'Add Course'}
                        </button>
                    </form>

                </div>

                <div className="hidden md:flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700"> Preview</h2>
                    <div className="border rounded-lg overflow-hidden shadow-md bg-white flex flex-col">
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            {form.imagePreview ? (
                                <img
                                    src={form.imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <div className="p-4 space-y-2">
                        <h3 className="text-lg font-bold">{form.price || 'Price'} $</h3>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                {categories.find(c => c.id.toString() === form.categoryId)?.name || 'Category'}
                            </span>
                            <h3 className="text-lg font-bold">{form.title || 'Course Title'}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3">{form.description || 'Description...'}</p>
                            <p className="text-xs text-gray-400">{form.duration || '0h 00m'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}