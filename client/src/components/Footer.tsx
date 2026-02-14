import React, { useEffect, useState } from 'react';
import { Github, Linkedin } from 'lucide-react';
import axios from 'axios';

interface SiteSettings {
    githubLink: string;
    linkedinLink: string;
    copyrightText: string;
    brandName?: string;
    logoUrl?: string;
}

const Footer: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        githubLink: 'https://github.com/Manish-Dark',
        linkedinLink: 'https://www.linkedin.com/in/manish-sharma-426039297',
        copyrightText: '2026 Manish Dark',
        brandName: 'EduPortal',
        logoUrl: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Adjust URL if needed based on your API setup
                const res = await axios.get('https://online-learning-portal-ciy7.onrender.com/api/site-settings');
                if (res.data) {
                    setSettings(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch site settings', error);
            }
        };

        fetchSettings();
    }, []);

    const logoUrl = settings.logoUrl ? `https://online-learning-portal-ciy7.onrender.com${settings.logoUrl}` : '';

    return (
        <footer className="bg-gray-900 text-white h-16 mt-auto w-full flex items-center">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center h-full">
                <div className="flex items-center space-x-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                    ) : (
                        <span className="text-xl font-bold">{settings.brandName}</span>
                    )}
                    <span className="text-sm font-light tracking-wider opacity-75">
                        | &copy; {settings.copyrightText}
                    </span>
                </div>

                <div className="flex space-x-6">
                    <a
                        href={settings.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors duration-300"
                        title="GitHub"
                    >
                        <Github size={24} />
                    </a>
                    <a
                        href={settings.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-colors duration-300"
                        title="LinkedIn"
                    >
                        <Linkedin size={24} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
