'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, Clock, User, DollarSign, BookOpen, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const checkEnrollment = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/user/courses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setIsEnrolled(data.courses?.some(c => c.id === parseInt(id)) || false);
        } catch (err) {
            console.error('Failed to check enrollment:', err);
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch course');
                }
                const data = await res.json();
                if (!data.course) {
                    throw new Error('Course data not found in response');
                }
                setCourse(data.course);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch course details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
        checkEnrollment();
    }, [id]);

    const handlePreviewCourse = () => {
        if (course?.topics?.length > 0) {
            const firstVideo = course.topics[0].video;
            if (firstVideo) {
                setSelectedVideo(firstVideo);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <p className="text-red-500 text-lg">{error || 'Course not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12 text-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/2">
                            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
                                {course.category.name}
                            </span>
                            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg opacity-90 mb-6">{course.description}</p>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    <span>By {course.user.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{course.duration || '0h 00m'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{course.topics.length} Topics</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold">${course.price.toFixed(2)}</span>
                                {isEnrolled ? (
                                    <span className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium">
                                        You own this course
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => router.push(`/payment/${course.id}`)}
                                        className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Enroll Now
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                                <img
                                    src={`https://res.cloudinary.com/djosldcjf/image/upload/c_fill,w_800,h_450/${course.image}`}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <button
                                        onClick={handlePreviewCourse}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/30 transition-colors"
                                    >
                                        <PlayCircle className="w-6 h-6" />
                                        <span>Preview Course</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                            Course Curriculum
                        </h2>
                    </div>

                    {course.topics.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No topics added yet.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {course.topics.map((topic, index) => (
                                <li key={topic.id} className="hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-lg">{topic.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Added on {new Date(topic.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedVideo(topic.video)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                            <span>Watch</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-6xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-4 bg-gray-800">
                            <h2 className="text-xl font-semibold text-white">
                                {course.topics.find(t => t.video === selectedVideo)?.title || 'Video Preview'}
                            </h2>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="p-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="aspect-video bg-black">
                            <video
                                key={selectedVideo} 
                                controls
                                autoPlay
                                className="w-full h-full"
                                playsInline
                                controlsList="nodownload"
                            >
                                <source
                                    src={`https://res.cloudinary.com/djosldcjf/video/upload/${selectedVideo}`}
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="p-4 bg-gray-800 flex justify-between items-center">
                            <span className="text-gray-300 text-sm">
                                {course.title} - {course.user.name}
                            </span>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}