import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LayoutDashboard, ArrowRight } from 'lucide-react';
import { signUp } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

interface AcademicCourse {
    name: string;
    branches: string[];
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', course: '', branch: '', fatherName: '', motherName: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [academicCourses, setAcademicCourses] = useState<AcademicCourse[]>([]);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        API.get('/site-settings')
            .then(res => {
                setSiteSettings(res.data);
                if (res.data.academicCourses && res.data.academicCourses.length > 0) {
                    setAcademicCourses(res.data.academicCourses);
                }
            })
            .catch(err => console.error('Failed to load courses:', err));
    }, []);

    const selectedCourseData = academicCourses.find(c => c.name === formData.course);
    const hasBranches = selectedCourseData && selectedCourseData.branches.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await signUp(formData);

            // If explicit message about approval, or no token, show message and redirect to login
            if (!data.token) {
                alert(data.message || "Registration successful. Please wait for admin approval.");
                navigate('/login');
                return;
            }

            // Auto login after register ONLY if token exists (Admin only basically)
            login({ ...data.result, role: formData.role }, data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex text-gray-900 bg-white">
            {/* Left Image Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden sticky top-0 h-screen">
                <img
                    src="/auth-bg.png"
                    alt="Abstract Tech Background"
                    className="absolute inset-x-0 inset-y-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-16 z-10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
                            <LayoutDashboard className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wider text-white">
                            {siteSettings?.authPageTitle || 'LEARNHUB'}
                        </span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 drop-shadow-lg">
                        {siteSettings?.authPageWelcomeText || 'Begin your journey with us.'}
                    </h2>
                    <p className="text-lg text-gray-300 max-w-lg leading-relaxed mix-blend-screen">
                        {siteSettings?.authPageDescription || 'Create an account to unlock exclusive courses, track your progress, and connect with expert educators globally.'}
                    </p>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative overflow-hidden">
                {/* Decorative background blobs for right side (visible on mobile too) */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl mix-blend-multiply pointer-events-none"></div>

                <div className="max-w-xl w-full relative z-10 py-10">
                    <div className="text-center lg:text-left mb-10">
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-2xl font-bold tracking-wider text-gray-900">
                                {siteSettings?.authPageTitle || 'LEARNHUB'}
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
                        <p className="mt-3 text-gray-500 text-lg">Join our community today.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm"
                                    placeholder="John Doe"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm"
                                    placeholder="you@example.com"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm pr-12"
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm cursor-pointer"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Dynamic Course Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                                <select
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm cursor-pointer"
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value, branch: '' })}
                                    required
                                >
                                    <option value="">
                                        {academicCourses.length === 0 ? 'Loading...' : 'Select Course'}
                                    </option>
                                    {academicCourses.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dynamic Branch Dropdown – only shown if selected course has branches */}
                            <div className="opacity-100 transition-opacity duration-300">
                                {hasBranches ? (
                                    <>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                                        <select
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm cursor-pointer"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {selectedCourseData!.branches.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </>
                                ) : (
                                    <div className="h-full"></div> // placeholder for grid
                                )}
                            </div>

                            {formData.role === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm"
                                            placeholder="Father's Name"
                                            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200 ease-in-out sm:text-sm shadow-sm"
                                            placeholder="Mother's Name"
                                            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg shadow-primary/30 active:scale-[0.98]"
                            >
                                Sign Up
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pb-8 lg:pb-0">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-indigo-600 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
