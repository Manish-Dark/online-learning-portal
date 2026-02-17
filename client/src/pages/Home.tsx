import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Home: React.FC = () => {
    // Add a timestamp to bust cache
    const bgUrl = `/uploads/landing-bg.jpg?t=${new Date().getTime()}`;
    const [brandName, setBrandName] = React.useState('EduPortal');

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                // We can import axios or just use fetch for zero-dependency if we didn't import axios in file
                // But let's assume axios is available or use fetch
                const res = await fetch('/api/site-settings');
                const data = await res.json();
                if (data && data.brandName) {
                    setBrandName(data.brandName);
                }
            } catch (error) {
                console.error('Failed to fetch site settings', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <style>
                {`
                    @keyframes kenburns {
                        0% { transform: scale(1) translate(0, 0); }
                        50% { transform: scale(1.1) translate(-1%, -1%); }
                        100% { transform: scale(1) translate(0, 0); }
                    }
                    .animate-kenburns {
                        animation: kenburns 20s ease-in-out infinite alternate;
                    }
                `}
            </style>
            <div className="flex-grow relative overflow-hidden flex flex-col justify-center items-center">
                {/* Animated Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-kenburns z-0"
                    style={{
                        backgroundImage: `url(${bgUrl})`,
                        backgroundColor: '#f9fafb'
                    }}
                />

                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-white/80 z-0"></div>

                <div className="text-center max-w-2xl px-4 z-10 relative">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Master New Skills with <span className="text-primary">{brandName}</span>
                    </h1>
                    <p className="text-xl text-gray-800 mb-8 font-medium">
                        The ultimate platform for students and teachers. Learn at your own pace, track your progress, and achieve your goals.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-indigo-700 transition shadow-lg">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
