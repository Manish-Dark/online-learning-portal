import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';




// ── Helpers ────────────────────────────────────────────────────────────────
const getFileExt = (fileUrl: string) => {
    if (!fileUrl) return '';
    const parts = fileUrl.split('.');
    return parts[parts.length - 1].toLowerCase();
};

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

const FILE_TYPE_ICON: Record<string, string> = {
    pdf: '📄', doc: '📝', docx: '📝',
    ppt: '📊', pptx: '📊',
    xls: '📈', xlsx: '📈',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    zip: '📦', txt: '📃',
};

// ── File Preview Modal ─────────────────────────────────────────────────────
const FilePreviewModal: React.FC<{ material: any; onClose: () => void }> = ({ material, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // For PDF / image / txt
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    // For Word → HTML string
    const [wordHtml, setWordHtml] = useState<string | null>(null);
    // For PPT → array of slide texts
    const [pptSlides, setPptSlides] = useState<string[] | null>(null);
    // For Excel → HTML table string
    const [excelHtml, setExcelHtml] = useState<string | null>(null);

    const ext = getFileExt(material.fileUrl || '');
    const isImage = IMAGE_EXTS.has(ext);
    const isPdf = ext === 'pdf';
    const isTxt = ext === 'txt';
    const isWord = ext === 'doc' || ext === 'docx';
    const isPpt = ext === 'ppt' || ext === 'pptx';
    const isXls = ext === 'xls' || ext === 'xlsx';

    const getToken = () => JSON.parse(localStorage.getItem('profile') || '{}').token;

    useEffect(() => {
        let objectUrl = '';
        (async () => {
            try {
                const token = getToken();
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${BASE_URL}/api/materials/download/${material._id}?inline=true`, { headers });
                if (!res.ok) throw new Error('Failed to fetch file');
                const arrayBuffer = await res.arrayBuffer();

                if (isPdf || isImage || isTxt) {
                    let mimeType = 'application/octet-stream';
                    if (isPdf) mimeType = 'application/pdf';
                    else if (isTxt) mimeType = 'text/plain';
                    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                    else if (ext === 'png') mimeType = 'image/png';
                    else if (ext === 'gif') mimeType = 'image/gif';
                    else if (ext === 'webp') mimeType = 'image/webp';

                    const blob = new Blob([arrayBuffer], { type: mimeType });
                    objectUrl = URL.createObjectURL(blob);
                    setBlobUrl(objectUrl);

                } else if (isWord) {
                    // mammoth: converts .docx to HTML
                    const mammoth = await import('mammoth');
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setWordHtml(result.value);

                } else if (isPpt) {
                    // jszip: open PPTX (which is a ZIP) and extract text paragraph-by-paragraph
                    const JSZip = (await import('jszip')).default;
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    const slideKeys = Object.keys(zip.files)
                        .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
                        .sort((a, b) => {
                            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                            return numA - numB;
                        });
                    // Each slide is an array of paragraph strings
                    const slides: string[][] = [];
                    for (const key of slideKeys) {
                        const xml = await zip.files[key].async('string');
                        const paragraphs: string[] = [];
                        // Split by paragraphs <a:p>...</a:p>
                        const paraRe = /<a:p[\s>][\s\S]*?<\/a:p>/g;
                        let para;
                        while ((para = paraRe.exec(xml)) !== null) {
                            // Collect all <a:t> text runs inside this paragraph
                            const runRe = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
                            let run;
                            const parts: string[] = [];
                            while ((run = runRe.exec(para[0])) !== null) {
                                const t = run[1]
                                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
                                if (t) parts.push(t);
                            }
                            const line = parts.join('');
                            if (line) paragraphs.push(line);
                        }
                        slides.push(paragraphs);
                    }
                    setPptSlides(slides as any);

                } else if (isXls) {
                    // SheetJS: parse workbook and render first sheet as HTML table
                    const XLSX = await import('xlsx');
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], { header: '', footer: '' });
                    setExcelHtml(html);
                }
            } catch (e: any) {
                console.error(e);
                setError('Could not load preview. Please download the file instead.');
            } finally {
                setLoading(false);
            }
        })();
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [material._id]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ background: 'rgba(17,24,39,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{FILE_TYPE_ICON[ext] || '📁'}</span>
                    <div className="min-w-0">
                        <h3 className="text-white font-bold truncate">{material.title}</h3>
                        <p className="text-xs uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{ext} file</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a href={`${BASE_URL}/api/materials/download/${material._id}`}
                        className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                        style={{ background: '#4f46e5' }}>
                        ⬇ Download
                    </a>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition text-lg"
                        style={{ color: 'rgba(255,255,255,0.6)' }}>✕</button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">

                {/* Loading */}
                {loading && (
                    <div className="text-center text-white">
                        <div className="text-4xl mb-3" style={{ animation: 'pulse 1.5s infinite' }}>⏳</div>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading preview…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center text-white max-w-sm">
                        <div className="text-4xl mb-3">⚠️</div>
                        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</p>
                        <a href={`${BASE_URL}/api/materials/download/${material._id}`}
                            className="text-white font-semibold px-6 py-2 rounded-xl inline-block"
                            style={{ background: '#4f46e5' }}>⬇ Download Instead</a>
                    </div>
                )}

                {/* PDF */}
                {blobUrl && isPdf && (
                    <object data={blobUrl} type="application/pdf" className="w-full h-full border-0 rounded-xl bg-white">
                        <div className="flex flex-col items-center justify-center p-8 text-center h-full max-w-sm mx-auto">
                            <div className="text-5xl mb-4">📄</div>
                            <h4 className="text-lg font-bold text-white mb-2">PDF Viewer Not Supported</h4>
                            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Your browser does not support inline PDFs. Don't worry, you can still download the file to view it.</p>
                            <a href={`${BASE_URL}/api/materials/download/${material._id}`}
                                className="text-white font-semibold px-6 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-lg"
                                style={{ background: '#4f46e5' }}>
                                ⬇ Download PDF
                            </a>
                        </div>
                    </object>
                )}

                {/* Image */}
                {blobUrl && isImage && <img src={blobUrl} alt={material.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />}

                {/* TXT */}
                {blobUrl && isTxt && <iframe src={blobUrl} className="w-full h-full border-0 rounded-xl bg-white" title={material.title} />}

                {/* Word → HTML */}
                {!loading && !error && wordHtml !== null && (
                    <div className="w-full h-full overflow-auto rounded-xl bg-white p-8 shadow-2xl" style={{ maxWidth: '900px' }}>
                        <div
                            className="prose max-w-none text-gray-900"
                            style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7, fontSize: '15px' }}
                            dangerouslySetInnerHTML={{ __html: wordHtml }}
                        />
                    </div>
                )}

                {/* PPT → Slide text */}
                {!loading && !error && pptSlides !== null && (
                    <div className="w-full h-full overflow-auto pb-4" style={{ maxWidth: '860px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Presentation — {(pptSlides as any[]).length} Slide{(pptSlides as any[]).length !== 1 ? 's' : ''}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(pptSlides as any[]).map((paragraphs: string[], i: number) => (
                                <div key={i} style={{ borderRadius: '16px', padding: '20px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                    {/* Slide label */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', letterSpacing: '0.05em' }}>
                                            SLIDE {i + 1}
                                        </span>
                                    </div>
                                    {paragraphs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {paragraphs.map((para, j) => (
                                                <p key={j} style={{
                                                    margin: 0,
                                                    color: j === 0 ? '#ffffff' : 'rgba(255,255,255,0.8)',
                                                    fontSize: j === 0 ? '17px' : '14px',
                                                    fontWeight: j === 0 ? 700 : 400,
                                                    lineHeight: 1.55,
                                                    paddingLeft: j === 0 ? '0' : '14px',
                                                    borderLeft: j === 0 ? 'none' : '2px solid rgba(165,180,252,0.4)',
                                                }}>
                                                    {para}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '13px', fontStyle: 'italic' }}>
                                            🖼️ Image / graphic slide — no text content
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Excel → HTML table */}
                {!loading && !error && excelHtml !== null && (
                    <div className="w-full h-full overflow-auto rounded-xl bg-white shadow-2xl p-4">
                        <style>{`
                            .xlsx-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .xlsx-table td, .xlsx-table th { border: 1px solid #e5e7eb; padding: 6px 10px; white-space: nowrap; }
                            .xlsx-table tr:nth-child(even) td { background: #f9fafb; }
                            .xlsx-table tr:first-child td { background: #ede9fe; font-weight: 700; color: #4c1d95; }
                        `}</style>
                        <div dangerouslySetInnerHTML={{
                            __html: excelHtml.replace('<table', '<table class="xlsx-table"')
                        }} />
                    </div>
                )}

                {/* ZIP / other */}
                {!loading && !error && !blobUrl && wordHtml === null && pptSlides === null && excelHtml === null && (
                    <div className="text-center text-white max-w-sm">
                        <div className="text-5xl mb-4">📦</div>
                        <h4 className="text-lg font-bold mb-2">Preview Not Available</h4>
                        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This file type cannot be previewed.</p>
                        <a href={`${BASE_URL}/api/materials/download/${material._id}`}
                            className="text-white font-semibold px-6 py-2 rounded-xl inline-block"
                            style={{ background: '#4f46e5' }}>⬇ Download File</a>
                    </div>
                )}
            </div>
        </div>
    );
};


// ── Material Card ──────────────────────────────────────────────────────────
const MaterialCard: React.FC<{ material: any }> = ({ material }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const ext = getFileExt(material.fileUrl || '');
    const icon = material.type === 'link' ? '🔗' : (FILE_TYPE_ICON[ext] || '📁');
    const downloadUrl = `${BASE_URL}/api/materials/download/${material._id}`;

    return (
        <>
            {previewOpen && <FilePreviewModal material={material} onClose={() => setPreviewOpen(false)} />}

            <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{material.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{material.uploadedBy?.name || 'Teacher'}</p>
                        </div>
                        {ext && (
                            <span className="shrink-0 text-xs font-bold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{ext}</span>
                        )}
                    </div>
                    {material.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{material.description}</p>
                    )}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-100">{material.course}</span>
                        {material.branch && (
                            <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full border border-purple-100">{material.branch}</span>
                        )}
                    </div>
                    <div className="mt-auto flex gap-2">
                        {material.type === 'link' ? (
                            <a href={material.linkUrl} target="_blank" rel="noopener noreferrer"
                                className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition">
                                Open Link ↗
                            </a>
                        ) : (
                            <>
                                <button onClick={() => setPreviewOpen(true)}
                                    className="flex-1 text-center bg-indigo-50 text-indigo-700 text-sm font-semibold py-2 rounded-xl hover:bg-indigo-100 transition">
                                    👁 View
                                </button>
                                <a href={downloadUrl}
                                    className="flex-1 text-center bg-green-50 text-green-700 text-sm font-semibold py-2 rounded-xl hover:bg-green-100 transition">
                                    ⬇ Download
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


// ── Quiz Card ──────────────────────────────────────────────────────────────
const QuizCard: React.FC<{ quiz: any }> = ({ quiz }) => (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />
        <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-gray-900 text-base leading-snug">{quiz.title}</h3>
                <span className="shrink-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {quiz.questions?.length || 0} Qs
                </span>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-5">
                {quiz.course && <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full border border-teal-100">🎓 {quiz.course}</span>}
                {quiz.branch && <span className="bg-cyan-50 text-cyan-700 text-xs font-medium px-2 py-0.5 rounded-full border border-cyan-100">🌿 {quiz.branch}</span>}
            </div>
            <Link to={`/take-quiz/${quiz._id}`}
                className="mt-auto block text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition shadow-sm">
                Start Quiz →
            </Link>
        </div>
    </div>
);

// ── Main StudentDashboard ──────────────────────────────────────────────────
const StudentDashboard: React.FC = () => {
    const { user: authUser } = useAuth();
    const [materials, setMaterials] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'materials' | 'quizzes' | 'history'>('materials');

    useEffect(() => {
        fetchAll();
    }, []);

    const getToken = () => {
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        return profile.token;
    };

    const fetchAll = async () => {
        const token = getToken();
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const [matRes, quizRes, profRes] = await Promise.all([
                fetch(`${BASE_URL}/api/materials`, { headers }),
                fetch(`${BASE_URL}/api/quizzes`, { headers }),
                fetch(`${BASE_URL}/api/auth/me`, { headers }),
            ]);
            if (matRes.ok) setMaterials(await matRes.json());
            if (quizRes.ok) setQuizzes(await quizRes.json());
            if (profRes.ok) setUser(await profRes.json());
        } catch (err) {
            console.error(err);
        }
    };

    // Compute stats
    const quizHistory = user?.progress?.flatMap((p: any) => p.quizScores).filter((qs: any) => qs?.quizId) || [];
    const avgScore = quizHistory.length > 0
        ? Math.round(quizHistory.reduce((sum: number, qs: any) => {
            const total = qs.quizId?.questions?.length || 1;
            return sum + (qs.score / total) * 100;
        }, 0) / quizHistory.length)
        : 0;

    const initials = (authUser?.name || 'S').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const tabs = [
        { key: 'materials', label: '📚 Materials', count: materials.length },
        { key: 'quizzes', label: '✏️ Quizzes', count: quizzes.length },
        { key: 'history', label: '📊 Quiz History', count: quizHistory.length },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* ── Profile Hero ── */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
                {/* decorative circles */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-extrabold border-2 border-white/30 shadow-lg flex-shrink-0">
                        {initials}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <p className="text-white/70 text-sm font-medium mb-0.5">Student</p>
                        <h2 className="text-3xl font-extrabold">{authUser?.name || user?.name}</h2>
                        <p className="text-white/70 mt-1 text-sm">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            <span className="bg-emerald-400/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200/30">
                                ✅ Approved
                            </span>
                            {user?.course && (
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                                    🎓 {user.course}
                                </span>
                            )}
                            {user?.branch && (
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                                    🌿 {user.branch}
                                </span>
                            )}
                        </div>
                    </div>

                    <button onClick={fetchAll}
                        className="shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                        🔄 Refresh
                    </button>
                </div>

                {/* ── Stats Row ── */}
                <div className="relative grid grid-cols-3 gap-4 mt-8">
                    {[
                        { icon: '📄', label: 'Study Materials', value: materials.length },
                        { icon: '✏️', label: 'Quizzes Available', value: quizzes.length },
                        { icon: '⭐', label: 'Avg. Quiz Score', value: `${avgScore}%` },
                    ].map(s => (
                        <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                            <div className="text-2xl">{s.icon}</div>
                            <div className="text-2xl font-extrabold mt-1">{s.value}</div>
                            <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Family Info ── */}
            {(user?.fatherName || user?.motherName) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.fatherName && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">👨</div>
                            <div>
                                <p className="text-xs text-gray-500">Father's Name</p>
                                <p className="font-semibold text-gray-800">{user.fatherName}</p>
                            </div>
                        </div>
                    )}
                    {user.motherName && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-lg">👩</div>
                            <div>
                                <p className="text-xs text-gray-500">Mother's Name</p>
                                <p className="font-semibold text-gray-800">{user.motherName}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab Navigation ── */}
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-full md:w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 md:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'materials' && (
                materials.length === 0 ? (
                    <EmptyState icon="📚" title="No Materials Yet" desc="Your teacher hasn't uploaded any study materials for your course/branch yet." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {materials.map(m => <MaterialCard key={m._id} material={m} />)}
                    </div>
                )
            )}

            {activeTab === 'quizzes' && (
                quizzes.length === 0 ? (
                    <EmptyState icon="✏️" title="No Quizzes Yet" desc="Your teacher hasn't created any quizzes for your course/branch yet." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {quizzes.map(q => <QuizCard key={q._id} quiz={q} />)}
                    </div>
                )
            )}

            {activeTab === 'history' && (
                quizHistory.length === 0 ? (
                    <EmptyState icon="📊" title="No Quiz Attempts" desc="You haven't taken any quizzes yet. Go to the Quizzes tab to get started!" />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-violet-50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {quizHistory.map((qs: any, i: number) => {
                                        const total = qs.quizId?.questions?.length || 0;
                                        const pct = total > 0 ? Math.round((qs.score / total) * 100) : 0;
                                        const pass = pct >= 70;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{qs.quizId?.title || 'Unknown Quiz'}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-800">{qs.score}</td>
                                                <td className="px-6 py-4 text-center text-gray-500">{total}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-24 bg-gray-100 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${pass ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className={`text-sm font-bold ${pass ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

const EmptyState: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 max-w-xs">{desc}</p>
    </div>
);

export default StudentDashboard;
