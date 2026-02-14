import React, { useEffect, useState } from 'react';
import { fetchCourses } from '../api';
import { Link } from 'react-router-dom';

const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { data } = await fetchCourses();
                setCourses(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadCourses();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <img src={course.thumbnail || 'https://via.placeholder.com/300'} alt={course.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{course.category}</span>
                            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">By {course.instructor?.name}</span>
                                <Link to={`/courses/${course._id}`} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
                                    View Course
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseList;
