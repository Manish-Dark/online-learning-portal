import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User } from 'lucide-react';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [brandName, setBrandName] = useState('EduPortal');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/site-settings');
                if (res.data) {
                    if (res.data.brandName) setBrandName(res.data.brandName);
                    if (res.data.logoUrl) setLogoUrl(`http://localhost:5000${res.data.logoUrl}`);
                }
            } catch (error) {
                console.error('Failed to fetch site settings', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-10 w-auto mr-2" />
                        ) : (
                            <BookOpen className="h-8 w-8 text-primary" />
                        )}
                        <span className="ml-2 text-xl font-bold text-gray-800">{brandName}</span>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                <div className="flex items-center ml-4">
                                    <User className="h-5 w-5 text-gray-500 mr-1" />
                                    <span className="text-gray-700 mr-4 font-semibold">{user.name} ({user.role || 'Student'})</span>
                                    <button onClick={logout} className="flex items-center text-gray-600 hover:text-red-600 transition duration-150">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 ml-3">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
