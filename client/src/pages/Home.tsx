import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { BASE_URL } from '../api';

interface SiteSettings {
    brandName: string;
    backgroundUrl: string;
    heroHeadline: string;
    heroSubtext: string;
    ctaButtonText: string;
    animationType: 'particles' | 'waves' | 'geometric' | 'gradient';
    animationSpeed: 'slow' | 'medium' | 'fast';
    primaryColor: string;
    particleCount: number;
    showFloatingCards: boolean;
}

const defaultSettings: SiteSettings = {
    brandName: 'EduPortal',
    backgroundUrl: '',
    heroHeadline: 'Master New Skills with',
    heroSubtext: 'The ultimate platform for students and teachers. Learn at your own pace, track your progress, and achieve your goals.',
    ctaButtonText: 'Get Started Free',
    animationType: 'particles',
    animationSpeed: 'medium',
    primaryColor: '#4F46E5',
    particleCount: 60,
    showFloatingCards: true,
};

// ─── Particle Canvas ───────────────────────────────────────────────────────────
interface Particle {
    x: number; y: number; vx: number; vy: number; radius: number; opacity: number;
}

const ParticleCanvas: React.FC<{ count: number; speed: number; color: string }> = ({ count, speed, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const animFrame = useRef<number>(0);

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const rgb = hexToRgb(color);
        particles.current = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed,
            radius: Math.random() * 2.5 + 1,
            opacity: Math.random() * 0.5 + 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const ps = particles.current;

            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb},${p.opacity})`;
                ctx.fill();

                for (let j = i + 1; j < ps.length; j++) {
                    const q = ps[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(${rgb},${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            animFrame.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animFrame.current);
            window.removeEventListener('resize', resize);
        };
    }, [count, speed, color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ─── Waves Canvas ──────────────────────────────────────────────────────────────
const WavesCanvas: React.FC<{ speed: number; color: string }> = ({ speed, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrame = useRef<number>(0);
    const t = useRef(0);

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const rgb = hexToRgb(color);

        const draw = () => {
            t.current += speed * 0.008;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const waves = [
                { amp: 40, freq: 0.008, offset: 0, alpha: 0.12 },
                { amp: 55, freq: 0.006, offset: Math.PI / 3, alpha: 0.08 },
                { amp: 30, freq: 0.012, offset: Math.PI * 0.7, alpha: 0.10 },
            ];
            waves.forEach(({ amp, freq, offset, alpha }) => {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                for (let x = 0; x <= canvas.width; x += 4) {
                    const y = canvas.height / 2 + Math.sin(x * freq + t.current + offset) * amp;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();
                ctx.fillStyle = `rgba(${rgb},${alpha})`;
                ctx.fill();
            });
            animFrame.current = requestAnimationFrame(draw);
        };
        draw();

        return () => { cancelAnimationFrame(animFrame.current); window.removeEventListener('resize', resize); };
    }, [speed, color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ─── Geometric Canvas ──────────────────────────────────────────────────────────
const GeometricCanvas: React.FC<{ speed: number; color: string }> = ({ speed, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrame = useRef<number>(0);

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const rgb = hexToRgb(color);
        const shapes = Array.from({ length: 18 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 40 + 15,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.01 * speed,
            vx: (Math.random() - 0.5) * 0.4 * speed,
            vy: (Math.random() - 0.5) * 0.4 * speed,
            sides: [3, 4, 6][i % 3],
            opacity: Math.random() * 0.12 + 0.04,
        }));

        const drawPolygon = (x: number, y: number, r: number, sides: number, rot: number) => {
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + rot;
                if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
                else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            }
            ctx.closePath();
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            shapes.forEach(s => {
                s.x += s.vx; s.y += s.vy; s.rotation += s.rotSpeed;
                if (s.x < -60 || s.x > canvas.width + 60) s.vx *= -1;
                if (s.y < -60 || s.y > canvas.height + 60) s.vy *= -1;
                drawPolygon(s.x, s.y, s.size, s.sides, s.rotation);
                ctx.strokeStyle = `rgba(${rgb},${s.opacity * 3})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = `rgba(${rgb},${s.opacity})`;
                ctx.fill();
            });
            animFrame.current = requestAnimationFrame(draw);
        };
        draw();

        return () => { cancelAnimationFrame(animFrame.current); window.removeEventListener('resize', resize); };
    }, [speed, color]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ─── Typewriter Hook ───────────────────────────────────────────────────────────
const useTypewriter = (text: string, speed = 60) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                setDone(true);
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, done };
};

// ─── Feature Card ──────────────────────────────────────────────────────────────
const features = [
    {
        icon: '🎓',
        title: 'Learn',
        desc: 'Access rich course materials, video lessons, and study guides crafted by expert teachers.',
        delay: '0ms',
    },
    {
        icon: '📊',
        title: 'Track',
        desc: 'Monitor your progress with detailed analytics, quiz scores, and completion milestones.',
        delay: '150ms',
    },
    {
        icon: '🏆',
        title: 'Achieve',
        desc: 'Earn recognition, build skills, and unlock new opportunities in your career.',
        delay: '300ms',
    },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const Home: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loaded, setLoaded] = useState(false);
    const [cardsVisible, setCardsVisible] = useState(false);
    const cardsRef = useRef<HTMLDivElement>(null);

    const speedMap = { slow: 0.6, medium: 1.2, fast: 2.2 };
    const typewriterSpeedMap = { slow: 90, medium: 55, fast: 25 };
    const numericSpeed = speedMap[settings.animationSpeed] ?? 1.2;

    const { displayed: typedHeadline, done: headlineDone } = useTypewriter(
        settings.heroHeadline,
        typewriterSpeedMap[settings.animationSpeed]
    );
    const { displayed: typedBrand } = useTypewriter(
        headlineDone ? settings.brandName : '',
        typewriterSpeedMap[settings.animationSpeed]
    );

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/site-settings`);
                const data = await res.json();
                if (data) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error('Failed to fetch site settings', err);
            } finally {
                setLoaded(true);
            }
        };
        fetchSettings();
    }, []);

    // Intersection observer for cards
    useEffect(() => {
        if (!settings.showFloatingCards) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setCardsVisible(true); },
            { threshold: 0.15 }
        );
        if (cardsRef.current) observer.observe(cardsRef.current);
        return () => observer.disconnect();
    }, [settings.showFloatingCards, loaded]);

    const bgUrl = settings.backgroundUrl
        ? settings.backgroundUrl.startsWith('http')
            ? settings.backgroundUrl
            : `${BASE_URL}${settings.backgroundUrl}`
        : '';

    const renderAnimation = () => {
        switch (settings.animationType) {
            case 'waves':
                return <WavesCanvas speed={numericSpeed} color={settings.primaryColor} />;
            case 'geometric':
                return <GeometricCanvas speed={numericSpeed} color={settings.primaryColor} />;
            case 'gradient':
                return null; // Pure CSS gradient blobs handle this
            case 'particles':
            default:
                return <ParticleCanvas count={settings.particleCount} speed={numericSpeed} color={settings.primaryColor} />;
        }
    };

    const primaryRgb = (() => {
        const hex = settings.primaryColor || '#4F46E5';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    })();

    const blobAnimDuration = { slow: '18s', medium: '10s', fast: '5s' }[settings.animationSpeed];
    const blob2AnimDuration = { slow: '22s', medium: '13s', fast: '7s' }[settings.animationSpeed];

    return (
        <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                @keyframes blob-move {
                    0%,100% { transform: translate(0,0) scale(1); }
                    33%     { transform: translate(30px,-20px) scale(1.08); }
                    66%     { transform: translate(-15px,25px) scale(0.95); }
                }
                @keyframes blob-move2 {
                    0%,100% { transform: translate(0,0) scale(1); }
                    33%     { transform: translate(-25px,20px) scale(1.05); }
                    66%     { transform: translate(20px,-30px) scale(0.92); }
                }
                @keyframes glow-pulse {
                    0%,100% { box-shadow: 0 0 30px 0px rgba(${primaryRgb},0.3), 0 0 60px 0px rgba(${primaryRgb},0.1); }
                    50%     { box-shadow: 0 0 50px 10px rgba(${primaryRgb},0.5), 0 0 100px 20px rgba(${primaryRgb},0.2); }
                }
                @keyframes fade-up {
                    from { opacity:0; transform:translateY(30px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity:0; }
                    to   { opacity:1; }
                }
                @keyframes slide-in-left {
                    from { opacity:0; transform:translateX(-40px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity:0; transform:translateX(40px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes float {
                    0%,100% { transform: translateY(0px); }
                    50%     { transform: translateY(-12px); }
                }
                @keyframes kenburns {
                    0%   { transform: scale(1)    translate(0, 0); }
                    50%  { transform: scale(1.08) translate(-1%,-1%); }
                    100% { transform: scale(1)    translate(0, 0); }
                }
                @keyframes cursor-blink {
                    0%,100% { opacity:1; }
                    50%     { opacity:0; }
                }

                .blob { animation: blob-move ${blobAnimDuration} ease-in-out infinite; }
                .blob2 { animation: blob-move2 ${blob2AnimDuration} ease-in-out infinite; }
                .hero-card { animation: glow-pulse 3s ease-in-out infinite; }
                .animate-fade-up { animation: fade-up 0.8s ease-out both; }
                .animate-fade-in { animation: fade-in 0.8s ease-out both; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-kenburns { animation: kenburns 20s ease-in-out infinite alternate; }
                .cursor { display:inline-block; animation: cursor-blink 0.85s step-end infinite; color: ${settings.primaryColor}; margin-left:1px; }
                .card-slide-left { animation: slide-in-left 0.7s ease-out both; }
                .card-slide-right { animation: slide-in-right 0.7s ease-out both; }
                .card-slide-up { animation: fade-up 0.7s ease-out both; }

                .glass-card {
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.18);
                }
                .feature-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(${primaryRgb},0.12);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 60px rgba(${primaryRgb},0.18);
                }
                .cta-btn {
                    background: linear-gradient(135deg, ${settings.primaryColor}, rgba(${primaryRgb},0.75));
                    box-shadow: 0 8px 32px rgba(${primaryRgb},0.4);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .cta-btn:hover {
                    transform: translateY(-3px) scale(1.04);
                    box-shadow: 0 16px 48px rgba(${primaryRgb},0.55);
                }
            `}</style>

            {/* ── HERO SECTION ── */}
            <div className="flex-grow relative overflow-hidden flex flex-col">
                {/* Background image (Ken Burns) */}
                {bgUrl && (
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-kenburns z-0"
                        style={{ backgroundImage: `url(${bgUrl})` }}
                    />
                )}

                {/* Dark gradient base */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: bgUrl
                            ? 'rgba(10,10,20,0.72)'
                            : `linear-gradient(135deg, #0f0c29 0%, #1a1040 45%, #1e0a3c 100%)`
                    }}
                />

                {/* Gradient blobs */}
                <div
                    className="blob absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 blur-3xl z-0"
                    style={{ background: `radial-gradient(circle, ${settings.primaryColor}, transparent 70%)` }}
                />
                <div
                    className="blob2 absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl z-0"
                    style={{ background: `radial-gradient(circle, ${settings.primaryColor}, transparent 70%)` }}
                />
                <div
                    className="blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full opacity-10 blur-3xl z-0"
                    style={{ background: `radial-gradient(circle, ${settings.primaryColor}, transparent 65%)` }}
                />

                {/* Canvas animation layer */}
                <div className="absolute inset-0 z-0">
                    {renderAnimation()}
                </div>

                {/* Hero content */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-6 py-24 text-center">
                    {/* Glassmorphism card */}
                    <div
                        className="hero-card glass-card rounded-3xl px-10 py-12 max-w-2xl w-full mx-auto"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 animate-fade-in"
                            style={{
                                background: `rgba(${primaryRgb},0.15)`,
                                border: `1px solid rgba(${primaryRgb},0.35)`,
                                color: settings.primaryColor,
                                animationDelay: '0.1s'
                            }}
                        >
                            <span className="animate-float" style={{ display: 'inline-block' }}>✦</span>
                            Next-Gen Learning Platform
                        </div>

                        {/* Headline with typewriter */}
                        <h1
                            className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2 animate-fade-up text-white"
                            style={{ animationDelay: '0.25s', letterSpacing: '-0.02em' }}
                        >
                            {typedHeadline}
                            {!headlineDone && <span className="cursor">|</span>}
                        </h1>
                        {headlineDone && (
                            <h1
                                className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6"
                                style={{ color: settings.primaryColor, letterSpacing: '-0.02em' }}
                            >
                                {typedBrand}<span className="cursor">|</span>
                            </h1>
                        )}

                        {/* Subtext */}
                        <p
                            className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed animate-fade-up"
                            style={{ animationDelay: '0.5s' }}
                        >
                            {settings.heroSubtext}
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className="flex justify-center gap-4 flex-wrap animate-fade-up"
                            style={{ animationDelay: '0.7s' }}
                        >
                            <Link
                                to="/register"
                                className="cta-btn text-white px-8 py-3.5 rounded-full font-bold text-base inline-flex items-center gap-2"
                            >
                                {settings.ctaButtonText}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                                </svg>
                            </Link>
                            <Link
                                to="/login"
                                className="text-white px-8 py-3.5 rounded-full font-semibold text-base inline-flex items-center gap-2 transition-all duration-200 hover:bg-white/10"
                                style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    {settings.showFloatingCards && (
                        <div
                            className="mt-12 animate-float animate-fade-in"
                            style={{ animationDelay: '1.2s' }}
                        >
                            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2 mx-auto">
                                <div
                                    className="w-1 h-2 rounded-full"
                                    style={{
                                        background: settings.primaryColor,
                                        animation: 'fade-up 1.5s ease-in-out infinite'
                                    }}
                                />
                            </div>
                            <p className="text-white/40 text-xs mt-2">Scroll to explore</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FEATURE CARDS SECTION ── */}
            {settings.showFloatingCards && (
                <div
                    className="bg-gray-50 py-20 px-6"
                    ref={cardsRef}
                >
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <h2
                                className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
                                style={cardsVisible ? { animation: 'fade-up 0.6s ease-out both' } : { opacity: 0 }}
                            >
                                Everything you need to
                                <span style={{ color: settings.primaryColor }}> succeed</span>
                            </h2>
                            <p
                                className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto"
                                style={cardsVisible ? { animation: 'fade-up 0.6s ease-out 0.15s both' } : { opacity: 0 }}
                            >
                                From first lesson to final achievement — we've got you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {features.map((f, i) => {
                                const animClass = i === 0
                                    ? 'card-slide-left'
                                    : i === 2
                                        ? 'card-slide-right'
                                        : 'card-slide-up';
                                return (
                                    <div
                                        key={f.title}
                                        className={`feature-card rounded-2xl p-8 shadow-lg text-center ${cardsVisible ? animClass : ''}`}
                                        style={cardsVisible ? { animationDelay: f.delay } : { opacity: 0 }}
                                    >
                                        <div
                                            className="text-5xl mb-5 animate-float inline-block"
                                            style={{ animationDelay: f.delay }}
                                        >
                                            {f.icon}
                                        </div>
                                        <h3
                                            className="text-xl font-bold text-gray-900 mb-3"
                                            style={{ color: i === 1 ? settings.primaryColor : undefined }}
                                        >
                                            {f.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>

                                        {/* Accent bottom bar */}
                                        <div
                                            className="mt-6 h-0.5 rounded-full mx-auto w-12"
                                            style={{ background: settings.primaryColor }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom CTA strip */}
                        <div
                            className="mt-16 text-center"
                            style={cardsVisible ? { animation: 'fade-up 0.6s ease-out 0.5s both' } : { opacity: 0 }}
                        >
                            <Link
                                to="/register"
                                className="cta-btn text-white px-10 py-4 rounded-full font-bold text-base inline-flex items-center gap-2"
                            >
                                Start your journey today
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Home;
