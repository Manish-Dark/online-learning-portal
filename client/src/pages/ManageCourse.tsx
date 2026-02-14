import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourse, fetchLessons, createLesson } from '../api';

const ManageCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', notes: '' });

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
        } catch (error) {
            console.error(error);
        }
    }

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLesson({ ...newLesson, courseId: id });
            setNewLesson({ title: '', videoUrl: '', notes: '' });
            setShowAddLesson(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    if (!course) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => setShowAddLesson(!showAddLesson)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        {showAddLesson ? 'Cancel' : 'Add Lesson'}
                    </button>
                    <a href={`/create-quiz/${id}`} className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 block">
                        Create Quiz
                    </a>
                </div>
            </div>

            {showAddLesson && (
                <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Add New Lesson</h3>
                    <form onSubmit={handleAddLesson} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Lesson Title"
                            required
                            className="block w-full border border-gray-300 rounded-md p-2"
                            value={newLesson.title}
                            onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Video URL (YouTube/Vimeo)"
                            required
                            className="block w-full border border-gray-300 rounded-md p-2"
                            value={newLesson.videoUrl}
                            onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                        />
                        <textarea
                            placeholder="Notes"
                            className="block w-full border border-gray-300 rounded-md p-2"
                            value={newLesson.notes}
                            onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Lesson</button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Lessons ({lessons.length})</h2>
                {lessons.length === 0 ? <p>No lessons added yet.</p> : (
                    lessons.map((lesson, index) => (
                        <div key={lesson._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="bg-gray-100 text-gray-600 w-8 h-8 flex items-center justify-center rounded-full mr-4 font-bold">{index + 1}</span>
                                <div>
                                    <h4 className="font-semibold text-lg">{lesson.title}</h4>
                                    <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline">Watch Video</a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageCourse;
