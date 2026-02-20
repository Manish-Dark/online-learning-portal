import React from 'react';
import API, { BASE_URL } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import API fetch if needed

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    // Mock for now removed

    if (!user.isApproved) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Your account is pending approval by the administrator. You cannot create courses yet.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const [materialData, setMaterialData] = React.useState({ title: '', description: '', course: 'B.Tech', branch: 'CSE', linkUrl: '' });
    const [files, setFiles] = React.useState<FileList | null>(null);
    const [uploadStatus, setUploadStatus] = React.useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
            // Auto-set title from first filename if title is empty
            if (!materialData.title) {
                const name = e.target.files[0].name.replace(/\.[^/.]+$/, "");
                setMaterialData(prev => ({ ...prev, title: name }));
            }
        }
    };

    // Old handleUpload removed, replaced by handleSubmit in the main render block logic


    const [activeOption, setActiveOption] = React.useState<'none' | 'upload' | 'link'>('none');

    // ... (keep handleFileChange)

    // Unified submit handler or separate? Unified is fine.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Handle Submit Called');
        console.log('Active Option:', activeOption);

        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const token = profile.token;

            if (!token) {
                setUploadStatus('Authentication failed. Please login again.');
                return;
            }

            let response;

            if (activeOption === 'link') {
                if (!materialData.linkUrl) {
                    setUploadStatus('Please provide a link URL');
                    return;
                }

                // Send JSON for link
                response = await fetch(`${BASE_URL}/api/materials/link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: materialData.title,
                        description: materialData.description,
                        course: materialData.course,
                        branch: materialData.branch,
                        linkUrl: materialData.linkUrl
                    })
                });

            } else {
                // Upload File
                if (!files || files.length === 0) {
                    setUploadStatus('Please select at least one file');
                    return;
                }

                if (files.length > 10) {
                    setUploadStatus('You can upload a maximum of 10 files at once.');
                    return;
                }

                const formData = new FormData();
                formData.append('title', materialData.title);
                formData.append('description', materialData.description);
                formData.append('course', materialData.course);
                formData.append('branch', materialData.branch);
                formData.append('type', 'file');

                // Append all files
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }

                setUploadStatus('Uploading...');

                response = await fetch(`${BASE_URL}/api/materials/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }

            if (response.ok) {
                setUploadStatus('Materials uploaded/linked successfully!');
                setMaterialData({ title: '', description: '', course: 'B.Tech', branch: 'CSE', linkUrl: '' });
                setFiles(null);

                // Reset file input value
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                fetchResources();
                setTimeout(() => { setActiveOption('none'); setUploadStatus(''); }, 2000);
            } else {
                const errorData = await response.json();
                setUploadStatus(errorData.message || 'Failed to upload material');
            }
        } catch (error) {
            console.error('Error uploading material:', error);
            setUploadStatus('Error uploading material');
        }
    };

    const [materials, setMaterials] = React.useState<any[]>([]);
    const [quizzes, setQuizzes] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const token = profile.token;
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Materials
            const matRes = await fetch(`${BASE_URL}/api/materials`, { headers });
            if (matRes.ok) setMaterials(await matRes.json());

            // Fetch Quizzes (Teacher sees all or we need a specific teacher route? 
            // Current getQuizzes filters by student completion OR returns all. 
            // Let's check getQuizzes logic: IF userRole is student checking completion. 
            // IF teacher, it returns all (filtered by nothing if no queries).
            // We might want to filter by "my uploaded ones" ideally, but for now getting all is fine per current backend logic.
            const quizRes = await fetch(`${BASE_URL}/api/quizzes`, { headers });
            if (quizRes.ok) setQuizzes(await quizRes.json());

        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleDeleteMaterial = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            await fetch(`${BASE_URL}/api/materials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${profile.token}` }
            });
            fetchResources(); // Refresh list
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleDeleteQuiz = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            await fetch(`${BASE_URL}/api/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${profile.token}` }
            });
            fetchResources(); // Refresh list
        } catch (error) {
            console.error('Delete error:', error);
        }
    };



    const [isResultsModalOpen, setIsResultsModalOpen] = React.useState(false);
    const [selectedQuizResults, setSelectedQuizResults] = React.useState<any[]>([]);

    const handleViewResults = async (quizId: string) => {
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/results`, {
                headers: { 'Authorization': `Bearer ${profile.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedQuizResults(data);
                setIsResultsModalOpen(true);
            } else {
                alert('Failed to fetch results');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            alert('Error fetching results');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Teacher Dashboard</h2>
                {/* <Link to="/create-course" ... > removed create course button if not needed, or keep it. User focused on materials/quiz. */}
            </div>

            {/* Selection Buttons */}
            {activeOption === 'none' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setActiveOption('upload')}
                        className="p-6 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-lg transition flex flex-col items-center justify-center text-center h-48"
                    >
                        <span className="text-4xl mb-4">📄</span>
                        <h3 className="text-xl font-bold text-blue-800">Upload PDF</h3>
                        <p className="text-blue-600 mt-2">Upload study materials, notes, or assignments.</p>
                    </button>

                    <button
                        onClick={() => setActiveOption('link')}
                        className="p-6 bg-purple-50 border border-purple-200 rounded-xl hover:shadow-lg transition flex flex-col items-center justify-center text-center h-48"
                    >
                        <span className="text-4xl mb-4">🔗</span>
                        <h3 className="text-xl font-bold text-purple-800">Share Link</h3>
                        <p className="text-purple-600 mt-2">Share YouTube videos, drive links, or resources.</p>
                    </button>

                    <Link
                        to="/create-quiz/general"
                        className="p-6 bg-green-50 border border-green-200 rounded-xl hover:shadow-lg transition flex flex-col items-center justify-center text-center h-48"
                    >
                        <span className="text-4xl mb-4">📝</span>
                        <h3 className="text-xl font-bold text-green-800">Create Quiz</h3>
                        <p className="text-green-600 mt-2">Create assessments for your students.</p>
                    </Link>
                </div>
            )}

            {/* Upload/Link Form */}
            {activeOption !== 'none' && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative">
                    <button
                        onClick={() => setActiveOption('none')}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        ✕ Close
                    </button>
                    <h3 className="text-xl font-bold mb-4">
                        {activeOption === 'upload' ? 'Upload Study Material (PDF)' : 'Share External Link'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {uploadStatus && <div className={`text-sm ${uploadStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{uploadStatus}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={materialData.title}
                                onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
                                required
                            />
                        </div>

                        {activeOption === 'link' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link URL (YouTube, Drive, etc.)</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={materialData.linkUrl || ''}
                                    onChange={(e) => setMaterialData({ ...materialData, linkUrl: e.target.value })}
                                    required
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={materialData.description}
                                onChange={(e) => setMaterialData({ ...materialData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Course</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={materialData.course}
                                    onChange={(e) => setMaterialData({ ...materialData, course: e.target.value })}
                                >
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="M.Tech">M.Tech</option>
                                    <option value="BCA">BCA</option>
                                    <option value="MCA">MCA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Branch</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={materialData.branch}
                                    onChange={(e) => setMaterialData({ ...materialData, branch: e.target.value })}
                                >
                                    <option value="CSE">CSE</option>
                                    <option value="CSD">CSD</option>
                                    <option value="AIML">AIML</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                            </div>
                        </div>

                        {activeOption === 'upload' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PDF Files (Max 10)</label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="application/pdf"
                                    multiple
                                    className="mt-1 block w-full"
                                    onChange={handleFileChange}
                                    required={activeOption === 'upload'}
                                />
                                {files && files.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Selected {files.length} file(s):
                                        <ul className="list-disc pl-5 mt-1">
                                            {Array.from(files).map((f, i) => (
                                                <li key={i}>{f.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setActiveOption('none')} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                                Cancel
                            </button>
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                {activeOption === 'upload' ? 'Upload Material' : 'Share Link'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Manage Materials Section */}
            <h3 className="text-xl font-bold mb-4 mt-8">Manage Materials</h3>
            {materials.length === 0 ? (
                <p className="text-gray-500 mb-6">No materials uploaded yet.</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {materials.map(m => (
                                <tr key={m._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{m.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.course} {m.branch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{m.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteMaterial(m._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Manage Quizzes Section */}
            <h3 className="text-xl font-bold mb-4 mt-8">Manage Quizzes</h3>
            {quizzes.length === 0 ? (
                <p className="text-gray-500 mb-6">No quizzes created yet.</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {quizzes.map(q => (
                                <tr key={q._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{q.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.course} {q.branch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.questions?.length || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleViewResults(q._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">View Results</button>
                                        <button onClick={() => handleDeleteQuiz(q._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Results Modal */}
            {isResultsModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Quiz Results</h3>
                            <button onClick={() => setIsResultsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        {selectedQuizResults.length === 0 ? (
                            <p className="text-gray-500">No students have taken this quiz yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedQuizResults.map((r: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.fatherName || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.motherName || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsResultsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

        </div >
    );
};

export default TeacherDashboard;
