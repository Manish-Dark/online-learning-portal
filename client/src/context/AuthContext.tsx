import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: any;
    login: (userData: any, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const profile = localStorage.getItem('profile');
        if (profile) {
            setUser(JSON.parse(profile).result);
        }
    }, []);

    const login = (userData: any, token: string) => {
        localStorage.setItem('profile', JSON.stringify({ result: userData, token }));
        setUser(userData);
        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
