import React, { useEffect, useState } from 'react';
import API from '../api';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, courseCount: 0 });
    const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);
    const [siteSettings, setSiteSettings] = useState({
        brandName: '',
        logoUrl: '',
        githubLink: '',
        linkedinLink: '',
        copyrightText: ''
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
            const studentsRes = await API.get('/admin/students/pending');
            setPendingStudents(studentsRes.data);
            const settingsRes = await API.get('/site-settings');
            setSiteSettings(settingsRes.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleApprove = async (id: string, role: 'teacher' | 'student') => {
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

    const handleReject = async (id: string, role: 'teacher' | 'student') => {
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

    const renderTable = (users: any[], role: 'teacher' | 'student', title: string) => (
        <div className="mb-10">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            {users.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">No pending approvals</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button
                                            onClick={() => handleApprove(user._id, role)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user._id, role)}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
            await API.post('/admin/upload-background', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Background image updated! Refresh the Landing Page to see changes.');
        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Failed to update background image.');
        }
    };

    const handleDeleteBackground = async () => {
        if (!window.confirm("Are you sure you want to remove the background image?")) return;
        try {
            await API.delete('/admin/background');
            alert('Background image removed! Refresh the Landing Page to see changes.');
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
            const res = await API.post('/admin/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update local state
            const newLogoUrl = res.data.filePath;
            setSiteSettings(prev => ({ ...prev, logoUrl: newLogoUrl }));

            // Auto-save the new logo URL to site settings
            await API.put('/site-settings', { ...siteSettings, logoUrl: newLogoUrl });

            alert('Logo updated and saved! Refresh to see changes across the site.');
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <button
                    onClick={loadData}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                >
                    🔄 Refresh Data
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-10">
                <h3 className="text-lg font-bold mb-4">Landing Page Settings</h3>

                <div className="mb-6">
                    <h4 className="text-md font-semibold mb-2">Background Image</h4>
                    {/* Preview Background */}
                    <div className="mb-4 h-48 w-full bg-gray-200 rounded-lg overflow-hidden relative border">
                        <img
                            src={`/uploads/landing-bg.jpg?t=${Date.now()}`}
                            alt="Background Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Background+Image')}
                        />
                        <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs p-1">Current Background</div>
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
                                    src={siteSettings.logoUrl}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.studentCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Teachers</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.teacherCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.courseCount}</p>
                </div>
            </div>

            {renderTable(pendingTeachers, 'teacher', 'Pending Teacher Approvals')}
            {renderTable(pendingStudents, 'student', 'Pending Student Approvals')}
        </div>
    );
};

export default AdminDashboard;
