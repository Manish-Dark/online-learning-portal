import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import StudentDashboard from '../components/StudentDashboard';
import TeacherDashboard from '../components/TeacherDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-lg">Please log in to view your dashboard.</p>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f9fafb 50%, #f0fdf4 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {user.role === 'admin' && (
                    <>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                            👋 Welcome back, <span className="text-indigo-600">{user.name}</span>!
                        </h1>
                        <AdminDashboard />
                    </>
                )}
                {user.role === 'teacher' && <TeacherDashboard />}
                {user.role === 'student' && <StudentDashboard />}
            </div>
        </div>
    );
};

export default Dashboard;
