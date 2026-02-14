import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourse, fetchLessons } from '../api';
import API from '../api';
import TakeQuiz from '../components/TakeQuiz';
import { PlayCircle } from 'lucide-react';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [activeLesson, setActiveLesson] = useState<any>(null);

    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [showQuiz, setShowQuiz] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const courseRes = await fetchCourse(id!);
            setCourse(courseRes.data);
            const lessonsRes = await fetchLessons(id!);
            setLessons(lessonsRes.data);
            if (lessonsRes.data.length > 0) setActiveLesson(lessonsRes.data[0]);

            // Fetch quizzes
            const quizzesRes = await API.get(`/quizzes/course/${id}`);
            setQuizzes(quizzesRes.data);
        } catch (error) {
            console.error(error);
        }
    }

    if (!course) return <div className="p-10 text-center">Loading course...</div>;

    if (showQuiz) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <TakeQuiz quiz={showQuiz} onClose={() => setShowQuiz(null)} />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Video Player */}
                    <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video flex items-center justify-center">
                        {activeLesson ? (
                            <iframe
                                src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                                title={activeLesson.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-white">Select a lesson to start watching</div>
                        )}
                    </div>

                    {/* Lesson Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900">{activeLesson?.title || course.title}</h2>
                        <p className="text-gray-600 mt-2">{activeLesson?.notes || course.description}</p>
                    </div>
                </div>

                {/* Sidebar / Lesson List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-bold text-lg text-gray-800">Course Content</h3>
                            <p className="text-sm text-gray-500">{lessons.length} Lessons</p>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {lessons.map((lesson, index) => (
                                <div
                                    key={lesson._id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${activeLesson?._id === lesson._id ? 'bg-indigo-50 border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="flex items-start">
                                        <span className="mt-1 mr-3 text-gray-400 text-sm font-mono">{index + 1}</span>
                                        <div>
                                            <h4 className={`text-sm font-medium ${activeLesson?._id === lesson._id ? 'text-primary' : 'text-gray-700'}`}>{lesson.title}</h4>
                                            <div className="flex items-center mt-1 text-xs text-gray-400">
                                                <PlayCircle className="w-3 h-3 mr-1" />
                                                <span>Video</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quizzes List */}
                        <div className="p-4 bg-gray-50 border-t border-b border-gray-200 mt-4">
                            <h3 className="font-bold text-lg text-gray-800">Quizzes</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {quizzes.length === 0 ? <p className="text-gray-500 text-sm">No quizzes available.</p> : (
                                quizzes.map((quiz) => (
                                    <button
                                        key={quiz._id}
                                        onClick={() => setShowQuiz(quiz)}
                                        className="w-full text-left p-3 border rounded-md hover:bg-gray-50 text-sm font-medium text-primary flex justify-between items-center"
                                    >
                                        <span>{quiz.title}</span>
                                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Start</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
