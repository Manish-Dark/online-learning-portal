import React, { useState } from 'react';
import { createCourse } from '../api';
import { useNavigate } from 'react-router-dom';

const CreateCourse: React.FC = () => {
    const [formData, setFormData] = useState({ title: '', description: '', category: '', thumbnail: '' });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await createCourse(formData);
            navigate(`/manage-course/${data._id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating course');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Course Title</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Create & Continue
                </button>
            </form>
        </div>
    );
};

export default CreateCourse;
