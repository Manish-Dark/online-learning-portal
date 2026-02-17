import React from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    // Mock data or fetch enrolled courses removed
    const [materials, setMaterials] = React.useState<any[]>([]);

    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        fetchMaterials();
        fetchProfile();
    }, []);

    const fetchMaterials = async () => {
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const token = profile.token;
            if (!token) return;

            const response = await fetch('/api/materials', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMaterials(await response.json());
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    }

    const fetchProfile = async () => {
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const token = profile.token;
            if (!token) return;

            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUser(await response.json());
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    return (
        <div>
            {/* Profile Section */}
            {user && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Name</p>
                            <p className="font-semibold">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-semibold">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Course</p>
                            <p className="font-semibold">{user.course}</p>
                        </div>
                        {user.branch && (
                            <div>
                                <p className="text-gray-600">Branch</p>
                                <p className="font-semibold">{user.branch}</p>
                            </div>
                        )}
                        {user.fatherName && (
                            <div>
                                <p className="text-gray-600">Father's Name</p>
                                <p className="font-semibold">{user.fatherName}</p>
                            </div>
                        )}
                        {user.motherName && (
                            <div>
                                <p className="text-gray-600">Mother's Name</p>
                                <p className="font-semibold">{user.motherName}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quiz History Section */}
            {user && user.progress && user.progress.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz History</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.progress.flatMap((p: any) => p.quizScores)
                                    .filter((qs: any) => qs.quizId) // Filter out deleted quizzes
                                    .map((qs: any, index: number) => {
                                        // Handle cases where quiz might be deleted (populated as null)
                                        const title = qs.quizId.title;
                                        const total = qs.quizId.questions?.length || 0;
                                        const percentage = total > 0 ? Math.round((qs.score / total) * 100) : 0;

                                        return (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{qs.score}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{total}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${percentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Study Materials Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Study Materials</h2>
                    <button
                        onClick={fetchMaterials}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition flex items-center"
                    >
                        🔄 Refresh
                    </button>
                </div>
                {materials.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-600">No study materials available for your course/branch yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material) => (
                            <div key={material._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{material.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                                    <span>{material.course} {material.branch ? `- ${material.branch}` : ''}</span>
                                    <span>By: {material.uploadedBy?.name || 'Teacher'}</span>
                                </div>
                                <div className="flex space-x-2">
                                    {material.type === 'link' ? (
                                        <a
                                            href={material.linkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-purple-100 text-purple-700 py-2 rounded hover:bg-purple-200 transition"
                                        >
                                            Open Link
                                        </a>
                                    ) : (
                                        <>
                                            <a
                                                href={`/api/${material.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-indigo-100 text-indigo-700 py-2 rounded hover:bg-indigo-200 transition"
                                            >
                                                View
                                            </a>
                                            <a
                                                href={`/api/download/${material._id}`}
                                                className="flex-1 text-center bg-green-100 text-green-700 py-2 rounded hover:bg-green-200 transition"
                                            >
                                                Download
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quizzes Section */}
            <QuizSection />


        </div>
    );
};

const QuizSection: React.FC = () => {
    const [quizzes, setQuizzes] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const profile = JSON.parse(localStorage.getItem('profile') || '{}');
                const token = profile.token;
                // Fetch all quizzes for now. 
                // Future improvement: Filter by student's course/branch if available in profile
                const response = await fetch('/api/quizzes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuizzes(data);
                }
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };
        fetchQuizzes();
    }, []);

    if (quizzes.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {quiz.questions?.length || 0} Qs
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                            {quiz.course && <span className="mr-2">🎓 {quiz.course}</span>}
                            {quiz.branch && <span>🌿 {quiz.branch}</span>}
                        </div>
                        <Link
                            to={`/take-quiz/${quiz._id}`}
                            className="block w-full text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-medium"
                        >
                            Start Quiz
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
