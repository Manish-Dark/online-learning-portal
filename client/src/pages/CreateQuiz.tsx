import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

interface AcademicCourse {
    name: string;
    branches: string[];
}

const CreateQuiz: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    const [academicCourses, setAcademicCourses] = useState<AcademicCourse[]>([]);

    // Dynamic selection states
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    useEffect(() => {
        API.get('/site-settings')
            .then(res => {
                if (res.data.academicCourses && res.data.academicCourses.length > 0) {
                    setAcademicCourses(res.data.academicCourses);
                }
            })
            .catch(err => console.error('Failed to load courses:', err));
    }, []);

    const selectedCourseData = academicCourses.find(c => c.name === selectedCourse);
    const hasBranches = selectedCourseData && selectedCourseData.branches.length > 0;

    const handleQuestionChange = (index: number, field: string, value: string) => {
        const newQuestions = [...questions];
        if (field === 'questionText') newQuestions[index].questionText = value;
        else if (field === 'correctAnswer') newQuestions[index].correctAnswer = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for general quiz
        if (courseId === 'general') {
            if (!selectedCourse) {
                alert('Please select a Target Course.');
                return;
            }
            if (hasBranches && !selectedBranch) {
                alert('Please select a Target Branch for this course.');
                return;
            }
        }

        try {
            await API.post('/quizzes', {
                title,
                // If specific course ID exists (from URL), send it. Else send string course/branch.
                courseId: courseId !== 'general' ? courseId : undefined,
                course: courseId === 'general' ? selectedCourse : undefined,
                branch: selectedBranch || undefined,
                questions
            });

            // Navigate back
            if (courseId === 'general') {
                alert('Quiz Created Successfully!');
                navigate('/dashboard');
            } else {
                navigate(`/manage-course/${courseId}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create quiz');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                {courseId === 'general' && (
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
                        <h3 className="font-semibold text-lg">Target Audience</h3>

                        {/* Dynamic Course Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Course</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={selectedCourse}
                                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBranch(''); }}
                                required
                            >
                                <option value="">
                                    {academicCourses.length === 0 ? 'Loading courses...' : 'Select Course'}
                                </option>
                                {academicCourses.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Branch Dropdown – only shown if selected course has branches */}
                        {hasBranches && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Branch</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {selectedCourseData!.branches.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h4 className="font-bold mb-2">Question {qIndex + 1}</h4>
                        <input
                            type="text"
                            placeholder="Question Text"
                            required
                            className="block w-full border border-gray-300 rounded-md p-2 mb-4"
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {q.options.map((opt, oIndex) => (
                                <input
                                    key={oIndex}
                                    type="text"
                                    placeholder={`Option ${oIndex + 1}`}
                                    required
                                    className="block w-full border border-gray-300 rounded-md p-2"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Correct Answer (must match one option exactly)"
                            required
                            className="block w-full border border-gray-300 rounded-md p-2 bg-green-50"
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        />
                    </div>
                ))}

                <button type="button" onClick={addQuestion} className="text-primary font-medium hover:underline">
                    + Add Question
                </button>

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-indigo-700">
                    Save Quiz
                </button>
            </form>
        </div>
    );
};

export default CreateQuiz;
