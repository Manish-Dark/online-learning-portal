import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


interface AcademicCourse { name: string; branches: string[]; }

// ── Stat Card ──────────────────────────────────────────────────────────────


// ── Action Card ────────────────────────────────────────────────────────────
const ActionCard: React.FC<{ icon: string; title: string; desc: string; onClick?: () => void; to?: string; color: string }> = ({ icon, title, desc, onClick, to, color }) => {
    const cls = `group relative flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer h-44 overflow-hidden ${color}`;
    const inner = (
        <>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10" />
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</span>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm opacity-75 mt-1">{desc}</p>
        </>
    );
    if (to) return <Link to={to} className={cls}>{inner}</Link>;
    return <div className={cls} onClick={onClick}>{inner}</div>;
};

// ── Results Modal ──────────────────────────────────────────────────────────
const ResultsModal: React.FC<{ results: any[]; onClose: () => void }> = ({ results, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">📊 Quiz Results</h3>
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
                {results.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-4xl mb-3">🎯</div>
                        <p className="text-gray-500">No students have attempted this quiz yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-indigo-50 to-violet-50">
                                <tr>
                                    {['Name', "Father's Name", "Mother's Name", 'Email', 'Score'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {results.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{r.fatherName || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{r.motherName || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{r.email}</td>
                                        <td className="px-4 py-3 font-bold text-indigo-700">{r.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Close</button>
                </div>
            </div>
        </div>
    </div>
);

// ── Quiz Preview Modal ─────────────────────────────────────────────────────
const QuizPreviewModal: React.FC<{ quiz: any; onClose: () => void }> = ({ quiz, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                    <p className="text-white/70 text-sm">{quiz.course} {quiz.branch ? `— ${quiz.branch}` : ''}</p>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
                {quiz.questions.map((q: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex gap-3">
                            <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                            {q.questionText}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                            {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className={`px-4 py-2.5 rounded-xl border text-sm ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-white border-gray-200 text-gray-600'}`}>
                                    <span className="mr-2 opacity-50">{String.fromCharCode(65 + oi)})</span> {opt}
                                    {opt === q.correctAnswer && <span className="ml-2 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">Correct</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0">
                <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Close Preview</button>
            </div>
        </div>
    </div>
);

// ── Upload / Link Form ─────────────────────────────────────────────────────
const MaterialForm: React.FC<{
    mode: 'upload' | 'link';
    academicCourses: AcademicCourse[];
    onClose: () => void;
    onSuccess: () => void;
}> = ({ mode, academicCourses, onClose, onSuccess }) => {
    const [data, setData] = useState({ title: '', description: '', course: '', branch: '', linkUrl: '' });
    const [files, setFiles] = useState<FileList | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedCourse = academicCourses.find(c => c.name === data.course);
    const hasBranches = selectedCourse && selectedCourse.branches.length > 0;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFiles(e.target.files);
            if (!data.title) setData(p => ({ ...p, title: e.target.files![0].name.replace(/\.[^/.]+$/, '') }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            const token = profile.token;
            if (!token) { setStatus('Authentication failed.'); setLoading(false); return; }

            let res;
            if (mode === 'link') {
                if (!data.linkUrl) { setStatus('Please provide a URL.'); setLoading(false); return; }
                res = await fetch(`${BASE_URL}/api/materials/link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
            } else {
                if (!files?.length) { setStatus('Please select a file.'); setLoading(false); return; }
                const fd = new FormData();
                fd.append('title', data.title); fd.append('description', data.description);
                fd.append('course', data.course); fd.append('branch', data.branch); fd.append('type', 'file');
                for (let i = 0; i < files.length; i++) fd.append('files', files[i]);
                setStatus('Uploading...');
                res = await fetch(`${BASE_URL}/api/materials/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
            }

            if (res.ok) {
                setStatus('✅ Success!');
                setTimeout(() => { onSuccess(); onClose(); }, 1200);
            } else {
                const err = await res.json();
                setStatus(err.message || 'Failed.');
            }
        } catch (err) { setStatus('Error occurred.'); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className={`px-6 py-5 flex justify-between items-center ${mode === 'upload' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-violet-600 to-purple-600'}`}>
                    <h3 className="text-xl font-bold text-white">
                        {mode === 'upload' ? '📄 Upload Study Material' : '🔗 Share External Link'}
                    </h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {status && (
                        <div className={`text-sm px-3 py-2 rounded-lg font-medium ${status.includes('✅') ? 'bg-green-50 text-green-700' : status === 'Uploading...' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                            {status}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                        <input type="text" required value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>

                    {mode === 'link' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL *</label>
                            <input type="url" required placeholder="https://..." value={data.linkUrl} onChange={e => setData(p => ({ ...p, linkUrl: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))} rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Course *</label>
                            <select required value={data.course} onChange={e => setData(p => ({ ...p, course: e.target.value, branch: '' }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                <option value="">{academicCourses.length === 0 ? 'Loading...' : 'Select Course'}</option>
                                {academicCourses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Target Branch {hasBranches ? '*' : '(optional)'}
                            </label>
                            <select value={data.branch} onChange={e => setData(p => ({ ...p, branch: e.target.value }))}
                                required={hasBranches ?? false}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                disabled={!data.course}>
                                <option value="">{!data.course ? 'Select course first' : hasBranches ? 'Select Branch' : 'No branches'}</option>
                                {hasBranches && selectedCourse!.branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    {mode === 'upload' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Files * (PDF, Word, PPT, Excel, Images — max 10 files, 50 MB each)</label>
                            <input id="file-upload" type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip"
                                multiple required onChange={handleFile}
                                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            {files && files.length > 0 && (
                                <ul className="mt-2 text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                                    {Array.from(files).map((f, i) => <li key={i}>{f.name}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={loading}
                            className={`flex-1 py-2.5 text-white font-bold rounded-xl transition ${mode === 'upload' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90'} disabled:opacity-50`}>
                            {loading ? 'Working...' : mode === 'upload' ? 'Upload' : 'Share Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main TeacherDashboard ──────────────────────────────────────────────────
const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [academicCourses, setAcademicCourses] = useState<AcademicCourse[]>([]);
    const [formMode, setFormMode] = useState<'none' | 'upload' | 'link'>('none');
    const [modalResults, setModalResults] = useState<any[] | null>(null);
    const [previewQuiz, setPreviewQuiz] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'materials' | 'quizzes'>('materials');

    useEffect(() => { fetchAll(); }, []);

    const getToken = () => JSON.parse(localStorage.getItem('profile') || '{}').token;

    const fetchAll = async () => {
        const token = getToken();
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const [matRes, quizRes, settRes] = await Promise.all([
                fetch(`${BASE_URL}/api/materials`, { headers }),
                fetch(`${BASE_URL}/api/quizzes`, { headers }),
                fetch(`${BASE_URL}/api/site-settings`)
            ]);
            if (matRes.status === 401 || quizRes.status === 401) {
                localStorage.clear();
                window.location.href = '/login?expired=true';
                return;
            }
            if (matRes.ok) setMaterials(await matRes.json());
            if (quizRes.ok) setQuizzes(await quizRes.json());
            if (settRes.ok) {
                const s = await settRes.json();
                if (s.academicCourses?.length) setAcademicCourses(s.academicCourses);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (type: 'materials' | 'quizzes', id: string) => {
        if (!window.confirm('Are you sure?')) return;
        await fetch(`${BASE_URL}/api/${type}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
        fetchAll();
    };

    const handleViewResults = async (quizId: string) => {
        const res = await fetch(`${BASE_URL}/api/quizzes/${quizId}/results`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
        if (res.ok) setModalResults(await res.json());
        else alert('Failed to fetch results');
    };

    const handleViewMaterial = (m: any) => {
        if (m.type === 'link') {
            window.open(m.linkUrl, '_blank');
        } else {
            window.open(`${BASE_URL}/api/materials/download/${m._id}?inline=true`, '_blank');
        }
    };

    const handlePreviewQuiz = (quiz: any) => {
        setPreviewQuiz(quiz);
    };

    const initials = (user?.name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    // Pending approval
    if (!user?.isApproved) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">⏳</div>
                <h3 className="text-xl font-bold text-gray-800">Account Pending Approval</h3>
                <p className="text-gray-500 max-w-sm">Your account is awaiting administrator approval. You'll be notified via email once approved.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Profile Hero ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
                <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full" />
                <div className="absolute -bottom-10 -left-8 w-36 h-36 bg-white/10 rounded-full" />

                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-extrabold border-2 border-white/30 shadow-lg flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-white/70 text-sm font-medium mb-0.5">Teacher</p>
                        <h2 className="text-3xl font-extrabold">{user?.name}</h2>
                        <p className="text-white/70 mt-1 text-sm">{user?.email}</p>
                        <span className="inline-block mt-3 bg-emerald-400/30 border border-emerald-200/30 text-white text-xs font-semibold px-3 py-1 rounded-full">✅ Approved</span>
                    </div>
                    <button onClick={fetchAll}
                        className="shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                        🔄 Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="relative grid grid-cols-2 gap-4 mt-8">
                    {[
                        { icon: '📄', label: 'Materials Uploaded', value: materials.length },
                        { icon: '✏️', label: 'Quizzes Created', value: quizzes.length },
                    ].map(s => (
                        <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                            <div className="text-2xl">{s.icon}</div>
                            <div className="text-2xl font-extrabold mt-1">{s.value}</div>
                            <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ActionCard icon="📁" title="Upload Files" desc="PDF, Word, PPT, Excel, Images & more"
                        onClick={() => setFormMode('upload')}
                        color="bg-blue-600 text-white border-blue-700 hover:shadow-blue-200 hover:shadow-xl" />
                    <ActionCard icon="🔗" title="Share Link" desc="YouTube, Google Drive, external resources"
                        onClick={() => setFormMode('link')}
                        color="bg-violet-600 text-white border-violet-700 hover:shadow-violet-200 hover:shadow-xl" />
                    <ActionCard icon="✏️" title="Create Quiz" desc="Build assessments for your students"
                        to="/create-quiz/general"
                        color="bg-emerald-600 text-white border-emerald-700 hover:shadow-emerald-200 hover:shadow-xl" />
                </div>
            </div>

            {/* ── Tabs ── */}
            <div>
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit mb-6">
                    {[
                        { key: 'materials', label: '📄 Materials', count: materials.length },
                        { key: 'quizzes', label: '✏️ Quizzes', count: quizzes.length },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Materials Table */}
                {activeTab === 'materials' && (
                    materials.length === 0 ? (
                        <TeacherEmpty icon="📄" title="No Materials Uploaded" desc="Click 'Upload PDF' or 'Share Link' above to add your first material." />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <tr>
                                            {['Title', 'Target', 'Type', 'Actions'].map((h, i) => (
                                                <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {materials.map(m => (
                                            <tr key={m._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{m.title}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full mr-1">{m.course}</span>
                                                    {m.branch && <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">{m.branch}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${m.type === 'link' ? 'bg-violet-100 text-violet-700' :
                                                            (() => {
                                                                const e = (m.fileUrl || '').split('.').pop()?.toLowerCase();
                                                                if (e === 'pdf') return 'bg-red-100 text-red-700';
                                                                if (e === 'doc' || e === 'docx') return 'bg-blue-100 text-blue-700';
                                                                if (e === 'ppt' || e === 'pptx') return 'bg-orange-100 text-orange-700';
                                                                if (e === 'xls' || e === 'xlsx') return 'bg-green-100 text-green-700';
                                                                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(e || '')) return 'bg-pink-100 text-pink-700';
                                                                return 'bg-gray-100 text-gray-600';
                                                            })()
                                                        }`}>
                                                        {m.type === 'link' ? '🔗 Link' : (() => {
                                                            const e = (m.fileUrl || '').split('.').pop()?.toLowerCase();
                                                            if (e === 'pdf') return '📄 PDF';
                                                            if (e === 'doc') return '📝 DOC';
                                                            if (e === 'docx') return '📝 DOCX';
                                                            if (e === 'ppt') return '📊 PPT';
                                                            if (e === 'pptx') return '📊 PPTX';
                                                            if (e === 'xls') return '📈 XLS';
                                                            if (e === 'xlsx') return '📈 XLSX';
                                                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(e || '')) return `🖼️ ${(e || '').toUpperCase()}`;
                                                            if (e === 'txt') return '📃 TXT';
                                                            if (e === 'zip') return '📦 ZIP';
                                                            return '📁 File';
                                                        })()}
                                                    </span>
                                                </td>
                                                 <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                    <button onClick={() => handleViewMaterial(m)}
                                                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition">
                                                        👁️ View
                                                    </button>
                                                    <button onClick={() => handleDelete('materials', m._id)}
                                                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition">
                                                        🗑 Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}

                {/* Quizzes Table */}
                {activeTab === 'quizzes' && (
                    quizzes.length === 0 ? (
                        <TeacherEmpty icon="✏️" title="No Quizzes Created" desc="Click 'Create Quiz' above to build your first assessment." />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                                        <tr>
                                            {['Title', 'Target', 'Questions', 'Actions'].map((h, i) => (
                                                <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {quizzes.map(q => (
                                            <tr key={q._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{q.title}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {q.course && <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full mr-1">🎓 {q.course}</span>}
                                                    {q.branch && <span className="bg-cyan-50 text-cyan-700 text-xs font-medium px-2 py-0.5 rounded-full">🌿 {q.branch}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        {q.questions?.length || 0} Qs
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                    <button onClick={() => handlePreviewQuiz(q)}
                                                        className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition">
                                                        👁️ Preview
                                                    </button>
                                                    <button onClick={() => handleViewResults(q._id)}
                                                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition">
                                                        📊 Results
                                                    </button>
                                                    <button onClick={() => handleDelete('quizzes', q._id)}
                                                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition">
                                                        🗑 Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            {formMode !== 'none' && (
                <MaterialForm mode={formMode} academicCourses={academicCourses} onClose={() => setFormMode('none')} onSuccess={fetchAll} />
            )}
            {modalResults !== null && (
                <ResultsModal results={modalResults} onClose={() => setModalResults(null)} />
            )}
            {previewQuiz !== null && (
                <QuizPreviewModal quiz={previewQuiz} onClose={() => setPreviewQuiz(null)} />
            )}
        </div>
    );
};

const TeacherEmpty: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-base font-bold text-gray-700 mb-1">{title}</h3>
        <p className="text-sm text-gray-400 max-w-xs">{desc}</p>
    </div>
);

export default TeacherDashboard;
