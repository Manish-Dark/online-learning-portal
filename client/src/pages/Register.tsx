import React, { useState } from 'react';
import { signUp } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', course: '', branch: '', fatherName: '', motherName: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <select
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                required
                            >
                                <option value="">Select Course</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                            </select>
                        </div>
                        {(formData.course === 'B.Tech' || formData.course === 'M.Tech') && (
                            <div>
                                <select
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    <option value="CSE">CSE</option>
                                    <option value="CSD">CSD</option>
                                    <option value="AIML">AIML</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                            </div>
                        )}
                        {formData.role === 'student' && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Father's Name"
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Mother's Name"
                                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
