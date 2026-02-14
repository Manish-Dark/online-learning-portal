import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-course" element={<CreateCourse />} />
                        <Route path="/manage-course/:id" element={<ManageCourse />} />
                        <Route path="/create-quiz/:courseId" element={<CreateQuiz />} />
                        <Route path="/take-quiz/:id" element={<TakeQuiz />} />
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
};

export default App;
