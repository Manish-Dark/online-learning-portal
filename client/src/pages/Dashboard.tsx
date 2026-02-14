import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import StudentDashboard from '../components/StudentDashboard';
import TeacherDashboard from '../components/TeacherDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user) return <div className="text-center mt-20">Please log in to view dashboard.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back, {user.name}!</h1>
                {user.role === 'admin' ? <AdminDashboard /> : user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
            </div>
        </div>
    );
};

export default Dashboard;
