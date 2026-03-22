import React, { useEffect, useState } from 'react';
import API, { BASE_URL } from '../api';

interface AcademicCourse {
    name: string;
    branches: string[];
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, courseCount: 0 });
    const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
    const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
    const [activeAdmins, setActiveAdmins] = useState<any[]>([]);
    const [allTeachers, setAllTeachers] = useState<any[]>([]);
    const [allAdmins, setAllAdmins] = useState<any[]>([]);
    const [userTab, setUserTab] = useState<'teacher' | 'admin'>('teacher');
    const [editUser, setEditUser] = useState<any | null>(null);
    const [editRole, setEditRole] = useState<string>('');
    const [editForm, setEditForm] = useState<any>({});
    const [academicCourses, setAcademicCourses] = useState<AcademicCourse[]>([]);
    const [newCourseName, setNewCourseName] = useState('');
    const [newBranches, setNewBranches] = useState<{ [courseName: string]: string }>({});
    const [siteSettings, setSiteSettings] = useState({
        brandName: '',
        logoUrl: '',
        backgroundUrl: '',
        githubLink: '',
        linkedinLink: '',
        copyrightText: '',
        // Auth Pages
        authPageTitle: 'LEARNHUB',
        authPageWelcomeText: 'Begin your journey with us.',
        authPageDescription: 'Create an account to unlock exclusive courses, track your progress, and connect with expert educators globally.',
        // Animation & Hero
        heroHeadline: '',
        heroSubtext: '',
        ctaButtonText: '',
        animationType: 'particles',
        animationSpeed: 'medium',
        primaryColor: '#4F46E5',
        particleCount: 60,
        showFloatingCards: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const statsRes = await API.get('/admin/stats');
            setStats(statsRes.data);
            const teachersRes = await API.get('/admin/teachers/pending');
            setPendingTeachers(teachersRes.data);
            const pendingAdminsRes = await API.get('/admin/admins/pending');
            setPendingAdmins(pendingAdminsRes.data);
            const activeAdminsRes = await API.get('/admin/admins/active');
            setActiveAdmins(activeAdminsRes.data);
            const [teachRes, admRes] = await Promise.all([
                API.get('/admin/users/teachers'),
                API.get('/admin/users/admins'),
            ]);
            setAllTeachers(teachRes.data);
            setAllAdmins(admRes.data);
            const settingsRes = await API.get('/site-settings');
            setSiteSettings(settingsRes.data);
            if (settingsRes.data.academicCourses) {
                setAcademicCourses(settingsRes.data.academicCourses);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // ── Academic Courses Handlers ──
    const handleAddCourse = async () => {
        const name = newCourseName.trim();
        if (!name) return alert('Please enter a course name.');
        try {
            const res = await API.post('/admin/academic-courses', { name });
            setAcademicCourses(res.data.academicCourses);
            setNewCourseName('');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add course');
        }
    };

    const handleDeleteCourse = async (courseName: string) => {
        if (!window.confirm(`Delete course "${courseName}" and all its branches?`)) return;
        try {
            const res = await API.delete(`/admin/academic-courses/${encodeURIComponent(courseName)}`);
            setAcademicCourses(res.data.academicCourses);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete course');
        }
    };

    const handleAddBranch = async (courseName: string) => {
        const branch = (newBranches[courseName] || '').trim();
        if (!branch) return alert('Please enter a branch name.');
        try {
            const res = await API.post(`/admin/academic-courses/${encodeURIComponent(courseName)}/branches`, { branch });
            setAcademicCourses(res.data.academicCourses);
            setNewBranches(prev => ({ ...prev, [courseName]: '' }));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add branch');
        }
    };

    const handleDeleteBranch = async (courseName: string, branchName: string) => {
        try {
            const res = await API.delete(`/admin/academic-courses/${encodeURIComponent(courseName)}/branches/${encodeURIComponent(branchName)}`);
            setAcademicCourses(res.data.academicCourses);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete branch');
        }
    };

    const handleApprove = async (id: string, role: 'teacher') => {
        try {
            await API.put(`/admin/${role}s/${id}/approve`);
            loadData();
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} Approved successfully! An email notification has been sent.`);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error approving user';
            alert(`Failed to approve user: ${errorMessage}`);
        }
    }

    const handleApproveAdmin = async (id: string) => {
        try {
            await API.put(`/admin/admins/${id}/approve`);
            loadData();
            alert('Admin approved successfully! An email notification has been sent.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error approving admin');
        }
    };

    const handleRejectAdmin = async (id: string) => {
        if (!window.confirm('Are you sure you want to reject this admin?')) return;
        try {
            await API.put(`/admin/admins/${id}/reject`);
            loadData();
            alert('Admin rejected.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error rejecting admin');
        }
    };

    const handleDeleteUser = async (id: string, role: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) return;
        try {
            await API.delete(`/admin/users/${role}/${id}`);
            loadData();
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully.`);
        } catch (error: any) {
            alert(error.response?.data?.message || `Error deleting ${role}`);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.put(`/admin/users/${editRole}/${editUser._id}`, editForm);
            loadData();
            setEditUser(null);
            alert(`${editRole.charAt(0).toUpperCase() + editRole.slice(1)} updated successfully.`);
        } catch (error: any) {
            alert(error.response?.data?.message || `Error updating ${editRole}`);
        }
    };

    const openEditModal = (user: any, role: string) => {
        setEditUser(user);
        setEditRole(role);
        setEditForm({
            name: user.name,
            email: user.email,
            password: '', // blank by default, only update if typed
            fatherName: '',
            motherName: '',
            course: '',
            branch: ''
        });
    };

    const handleReject = async (id: string, role: 'teacher') => {
        if (!window.confirm("Are you sure you want to reject this user?")) return;
        try {
            await API.put(`/admin/${role}s/${id}/reject`);
            loadData();
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} Rejected successfully! An email notification has been sent.`);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error rejecting user';
            alert(`Failed to reject user: ${errorMessage}`);
        }
    }

    const handleApproveAll = async (role: 'teacher' | 'admin') => {
        if (!window.confirm(`Are you sure you want to approve all pending ${role}s?`)) return;
        try {
            await API.put(`/admin/${role}s/approve-all`);
            loadData();
            alert(`All pending ${role}s approved successfully!`);
        } catch (error: any) {
            console.error(error);
            alert(`Failed to approve all ${role}s: ${error.response?.data?.message || 'Error'}`);
        }
    };

    const renderTable = (users: any[], role: 'teacher', title: string) => (
        <div className="mb-10 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {title}
                </div>
                {users.length > 0 && (
                    <button 
                        onClick={() => handleApproveAll(role)}
                        className="text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-1.5 rounded-lg transition font-bold shadow-sm"
                    >
                        Approve All
                    </button>
                )}
            </h3>
            {users.length === 0 ? (
                <div className="bg-white/60 backdrop-blur border border-white p-10 rounded-3xl shadow-sm text-center">
                    <div className="text-4xl mb-3 opacity-50">✨</div>
                    <p className="text-gray-500 font-medium">No pending {role} approvals at the moment.</p>
                </div>
            ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-indigo-100 text-indigo-700 flex flex-col justify-center items-center rounded-full font-bold text-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${role === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(user._id, role)}
                                                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(user._id, role)}
                                                    className="bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await API.post('/admin/upload-background', formData);

            // Update local state and auto-save the new background URL to site settings
            const newBgUrl = res.data.filePath;
            setSiteSettings(prev => ({ ...prev, backgroundUrl: newBgUrl }));
            await API.put('/site-settings', { ...siteSettings, backgroundUrl: newBgUrl });

            alert('Background image updated!');
            window.location.reload();
        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Failed to update background image.');
        }
    };

    const handleDeleteBackground = async () => {
        if (!window.confirm("Are you sure you want to remove the background image?")) return;
        try {
            await API.delete('/admin/background');
            setSiteSettings(prev => ({ ...prev, backgroundUrl: '' }));
            await API.put('/site-settings', { ...siteSettings, backgroundUrl: '' });
            alert('Background image removed!');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting background:', error);
            alert('Failed to delete background image.');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await API.post('/admin/upload-logo', formData);

            // Update local state
            const newLogoUrl = res.data.filePath;
            setSiteSettings(prev => ({ ...prev, logoUrl: newLogoUrl }));

            // Auto-save the new logo URL to site settings
            await API.put('/site-settings', { ...siteSettings, logoUrl: newLogoUrl });

            alert('Logo updated and saved!');
            window.location.reload();
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Failed to update logo.');
        }
    };

    const handleDeleteLogo = async () => {
        if (!window.confirm("Are you sure you want to remove the logo?")) return;
        try {
            await API.delete('/admin/logo');
            setSiteSettings(prev => ({ ...prev, logoUrl: '' }));
            alert('Logo removed!');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting logo:', error);
            alert('Failed to delete logo.');
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.put('/site-settings', siteSettings);
            alert('Site settings updated successfully!');
        } catch (error) {
            console.error('Error updating site settings:', error);
            alert('Failed to update site settings.');
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-indigo-100 text-sm mt-1">Manage platform settings, users, and content</p>
                </div>
                <button
                    onClick={loadData}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm flex items-center gap-2"
                >
                    <span>🔄</span> Refresh Data
                </button>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl text-xl">🎨</span>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Landing Page Settings</h3>
                        <p className="text-sm text-gray-500">Configure visual themes, copies, and animation styles</p>
                    </div>
                </div>

                {/* ── ANIMATION & HERO SETTINGS ── */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-5">
                        <h4 className="text-lg font-semibold text-gray-800">Animation & Hero</h4>
                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 font-medium border border-indigo-100 capitalize shadow-sm">
                            {siteSettings.animationType || 'particles'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Hero Headline */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label>
                            <input
                                type="text"
                                value={siteSettings.heroHeadline}
                                onChange={(e) => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Master New Skills with"
                            />
                            <p className="text-xs text-gray-400 mt-1">The first line of the hero — typewriter animated. Brand name appears after it.</p>
                        </div>

                        {/* Hero Subtext */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtext</label>
                            <textarea
                                value={siteSettings.heroSubtext}
                                onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtext: e.target.value })}
                                rows={2}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="The ultimate platform for students and teachers..."
                            />
                        </div>

                        {/* CTA Button Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                            <input
                                type="text"
                                value={siteSettings.ctaButtonText}
                                onChange={(e) => setSiteSettings({ ...siteSettings, ctaButtonText: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Get Started Free"
                            />
                        </div>

                        {/* Primary Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Accent Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={siteSettings.primaryColor || '#4F46E5'}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                                    className="h-9 w-14 rounded border border-gray-300 cursor-pointer p-0.5"
                                />
                                <input
                                    type="text"
                                    value={siteSettings.primaryColor || '#4F46E5'}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border font-mono"
                                    placeholder="#4F46E5"
                                />
                            </div>
                        </div>

                        {/* Animation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Animation Type</label>
                            <select
                                value={siteSettings.animationType}
                                onChange={(e) => setSiteSettings({ ...siteSettings, animationType: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="particles">✦ Particles (Connected Dots)</option>
                                <option value="waves">〜 Waves</option>
                                <option value="geometric">◆ Geometric Shapes</option>
                                <option value="gradient">◉ Gradient Blobs Only</option>
                            </select>
                        </div>

                        {/* Animation Speed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Animation Speed</label>
                            <select
                                value={siteSettings.animationSpeed}
                                onChange={(e) => setSiteSettings({ ...siteSettings, animationSpeed: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            >
                                <option value="slow">🐢 Slow</option>
                                <option value="medium">⚡ Medium</option>
                                <option value="fast">🚀 Fast</option>
                            </select>
                        </div>

                        {/* Particle Count (only for particles mode) */}
                        {siteSettings.animationType === 'particles' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Particle Count: <span className="text-indigo-600 font-bold">{siteSettings.particleCount}</span>
                                </label>
                                <input
                                    type="range"
                                    min={10}
                                    max={150}
                                    step={5}
                                    value={siteSettings.particleCount}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, particleCount: Number(e.target.value) })}
                                    className="w-full accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>10 (minimal)</span>
                                    <span>150 (dense)</span>
                                </div>
                            </div>
                        )}

                        {/* Show Feature Cards */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={siteSettings.showFloatingCards}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, showFloatingCards: e.target.checked })}
                                    />
                                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${siteSettings.showFloatingCards ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${siteSettings.showFloatingCards ? 'translate-x-5' : ''}`} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Show Feature Cards Section</span>
                                    <p className="text-xs text-gray-400">Display the Learn / Track / Achieve animated cards below the hero</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── BACKGROUND IMAGE ── */}
                <div className="mb-6">
                    <h4 className="text-md font-semibold mb-2">Background Image</h4>
                    <div className="mb-4 h-48 w-full bg-gray-200 rounded-lg overflow-hidden relative border flex items-center justify-center">
                        {siteSettings.backgroundUrl ? (
                            <>
                                <img
                                    src={siteSettings.backgroundUrl.startsWith('http') ? siteSettings.backgroundUrl : `${BASE_URL}${siteSettings.backgroundUrl}`}
                                    alt="Background Preview"
                                    className="w-full h-full object-cover relative z-10"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs p-1 z-20">Current Background</div>
                            </>
                        ) : (
                            <span className="text-gray-500 absolute z-0">No Background Image</span>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Background Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundUpload}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-indigo-700"
                        />
                        <button
                            onClick={handleDeleteBackground}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
                        >
                            Remove
                        </button>
                    </div>
                </div>

                <div className="mb-6 border-t pt-6">
                    <h4 className="text-md font-semibold mb-2">Brand Logo</h4>

                    {/* Preview Logo */}
                    <div className="mb-4 flex items-center space-x-4">
                        <div className="h-16 w-auto bg-gray-100 p-2 rounded border">
                            {siteSettings.logoUrl ? (
                                <img
                                    src={siteSettings.logoUrl.startsWith('http') ? siteSettings.logoUrl : `${BASE_URL}${siteSettings.logoUrl}`}
                                    alt="Logo Preview"
                                    className="h-full w-auto"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">No Logo</span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">Current Logo Preview</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Logo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-indigo-700"
                        />
                        <button
                            onClick={handleDeleteLogo}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
                        >
                            Remove
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Uploading a logo will automatically update the site settings.</p>
                </div>

                <div className="border-t pt-6">
                    <h4 className="text-md font-semibold mb-4">Site Details</h4>
                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                            <input
                                type="text"
                                value={siteSettings.brandName}
                                onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="EduPortal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
                            <input
                                type="url"
                                value={siteSettings.githubLink}
                                onChange={(e) => setSiteSettings({ ...siteSettings, githubLink: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn Link</label>
                            <input
                                type="url"
                                value={siteSettings.linkedinLink}
                                onChange={(e) => setSiteSettings({ ...siteSettings, linkedinLink: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Copyright Text</label>
                            <input
                                type="text"
                                value={siteSettings.copyrightText}
                                onChange={(e) => setSiteSettings({ ...siteSettings, copyrightText: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="2026 Your Name"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                            Save Settings
                        </button>
                    </form>
                </div>

                {/* ── AUTHENTICATION PAGES CONTENT ── */}
                <div className="border-t pt-6 mt-6">
                    <h4 className="text-md font-semibold mb-4 text-gray-800">Authentication Pages Content</h4>
                    <p className="text-sm text-gray-500 mb-4">Customize the text displayed on the left side of the Login and Registration pages.</p>
                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Platform Name / Title</label>
                            <input
                                type="text"
                                value={siteSettings.authPageTitle || ''}
                                onChange={(e) => setSiteSettings({ ...siteSettings, authPageTitle: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="LEARNHUB"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Welcome Text</label>
                            <input
                                type="text"
                                value={siteSettings.authPageWelcomeText || ''}
                                onChange={(e) => setSiteSettings({ ...siteSettings, authPageWelcomeText: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Begin your journey with us."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description Text</label>
                            <textarea
                                value={siteSettings.authPageDescription || ''}
                                onChange={(e) => setSiteSettings({ ...siteSettings, authPageDescription: e.target.value })}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Create an account to unlock exclusive courses..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                            Save Settings
                        </button>
                    </form>
                </div>
            </div>

            {/* ── ACADEMIC COURSES & BRANCHES ── */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 mb-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <span className="bg-purple-100 text-purple-600 p-2.5 rounded-xl text-xl">🎓</span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Academic Courses &amp; Branches</h3>
                            <p className="text-sm text-gray-500">Manage structure for Registration &amp; Quizzes</p>
                        </div>
                    </div>
                </div>

                {/* Add Course */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <input
                        type="text"
                        placeholder="Enter new course name (e.g. MBA)..."
                        value={newCourseName}
                        onChange={e => setNewCourseName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCourse()}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                    <button
                        onClick={handleAddCourse}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-purple-700 transition shadow-sm whitespace-nowrap"
                    >
                        + Add Course
                    </button>
                </div>

                {academicCourses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <span className="text-4xl block mb-3 opacity-50">📚</span>
                        <p className="text-gray-500 font-medium">No courses configured yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Start by adding a master course above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {academicCourses.map(course => (
                            <div key={course.name} className="group border border-gray-100 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>

                                {/* Course Header */}
                                <div className="flex items-center justify-between mb-4 relative z-10 border-b border-gray-50 pb-3">
                                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        {course.name}
                                    </h4>
                                    <button
                                        onClick={() => handleDeleteCourse(course.name)}
                                        className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-1"
                                        title="Delete entire course"
                                    >
                                        🗑 Delete
                                    </button>
                                </div>

                                {/* Branches */}
                                <div className="flex flex-wrap gap-2 mb-5 relative z-10 min-h-[40px]">
                                    {course.branches.length === 0 ? (
                                        <span className="text-xs text-gray-400 italic flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-full">
                                            ℹ️ No branches. Students will only select this course.
                                        </span>
                                    ) : (
                                        course.branches.map(branch => (
                                            <span
                                                key={branch}
                                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-100/50 shadow-sm"
                                            >
                                                {branch}
                                                <button
                                                    onClick={() => handleDeleteBranch(course.name, branch)}
                                                    className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-purple-100 text-purple-600 hover:bg-red-100 hover:text-red-500 transition"
                                                    title={`Remove ${branch}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* Add Branch */}
                                <div className="flex gap-2 relative z-10 mt-auto">
                                    <input
                                        type="text"
                                        placeholder="Add a branch..."
                                        value={newBranches[course.name] || ''}
                                        onChange={e => setNewBranches(prev => ({ ...prev, [course.name]: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && handleAddBranch(course.name)}
                                        className="flex-1 border border-gray-200 bg-gray-50/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition"
                                    />
                                    <button
                                        onClick={() => handleAddBranch(course.name)}
                                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 p-8 rounded-3xl shadow-xl text-white group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-blue-100 font-semibold uppercase tracking-wider text-sm">Total Students</h3>
                            <span className="text-3xl">👨‍🎓</span>
                        </div>
                        <p className="text-5xl font-extrabold">{stats.studentCount}</p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 p-8 rounded-3xl shadow-xl text-white group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-emerald-100 font-semibold uppercase tracking-wider text-sm">Total Teachers</h3>
                            <span className="text-3xl">👨‍🏫</span>
                        </div>
                        <p className="text-5xl font-extrabold">{stats.teacherCount}</p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-fuchsia-500 p-8 rounded-3xl shadow-xl text-white group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-purple-100 font-semibold uppercase tracking-wider text-sm">Total Courses</h3>
                            <span className="text-3xl">📚</span>
                        </div>
                        <p className="text-5xl font-extrabold">{academicCourses.length}</p>
                    </div>
                </div>
            </div>

            {renderTable(pendingTeachers, 'teacher', 'Pending Teacher Approvals')}

            {/* ── PENDING ADMIN APPROVALS ── */}
            <div className="mb-10 animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        🛡️ Pending Admin Approvals
                    </div>
                    {pendingAdmins.length > 0 && (
                        <button 
                            onClick={() => handleApproveAll('admin')}
                            className="text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-1.5 rounded-lg transition font-bold shadow-sm"
                        >
                            Approve All
                        </button>
                    )}
                </h3>
                {pendingAdmins.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur border border-white p-10 rounded-3xl shadow-sm text-center">
                        <div className="text-4xl mb-3 opacity-50">✨</div>
                        <p className="text-gray-500 font-medium">No pending admin approvals at the moment.</p>
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingAdmins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 shrink-0 bg-orange-100 text-orange-700 flex items-center justify-center rounded-full font-bold text-lg">
                                                        {admin.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{admin.name}</div>
                                                        <div className="text-sm text-gray-500">{admin.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">admin</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApproveAdmin(admin._id)}
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectAdmin(admin._id)}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── ACTIVE ADMINS ── */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 animate-fade-in-up">
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">👑 Active Admins</h3>
                {activeAdmins.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3 opacity-50">🛡️</div>
                        <p className="text-gray-500 font-medium">No active admins found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeAdmins.map((admin) => (
                            <div key={admin._id} className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm">
                                <div className="h-12 w-12 shrink-0 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-xl shadow">
                                    {admin.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{admin.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* ── USER MANAGEMENT SECTION ── */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 animate-fade-in-up mt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">👥 User Management</h3>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
                        {(['teacher', 'admin'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setUserTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                                    userTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                            >
                                {tab}s
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(userTab === 'teacher' ? allTeachers : allAdmins).map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 shrink-0 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-full font-bold text-lg border border-indigo-100">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {user.isApproved ? (
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved</span>
                                        ) : (
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                        )}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => openEditModal(user, userTab)}
                                                className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                            >
                                                Edit
                                            </button>
                                            
                                            {/* Hide delete button for the master admin account to prevent accidental lockout */}
                                            {!(userTab === 'admin' && user.email === 'manish1212@gmail.com') && (
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id, userTab)}
                                                    className="text-red-500 hover:text-red-700 font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(userTab === 'teacher' ? allTeachers : allAdmins).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium italic">
                                        No {userTab}s found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── EDIT USER MODAL ── */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Edit {editRole.charAt(0).toUpperCase() + editRole.slice(1)}</h3>
                            <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input type="text" required className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-xs font-normal text-gray-400">(login ID)</span></label>
                                    <input type="email" required className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password <span className="text-xs font-normal text-gray-400">(Leave blank to keep current)</span></label>
                                    <input type="text" placeholder="Type new password..." className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                                <button type="button" onClick={() => setEditUser(null)} className="px-5 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold transition">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md transition">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
