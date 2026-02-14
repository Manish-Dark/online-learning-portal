import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const TakeQuiz: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [result, setResult] = useState<{ score: number, total: number } | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const { data } = await API.get(`/quizzes/${id}`);
                setQuiz(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quiz:', error);
                alert('Failed to load quiz');
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleOptionSelect = (qIndex: number, option: string) => {
        setAnswers({ ...answers, [qIndex]: option });
    };

    const handleSubmit = async () => {
        // Validation: Ensure all questions are answered
        if (quiz && Object.keys(answers).length !== quiz.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            const { data } = await API.post('/quizzes/submit', {
                quizId: id,
                answers // sending object { 0: 'Option A', 1: 'Option B' }
            });
            setResult(data);
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
    if (!quiz) return <div className="p-8 text-center">Quiz not found</div>;

    if (result) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-indigo-500">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                    <p className="text-xl text-gray-600 mb-6">You scored:</p>
                    <div className="text-6xl font-bold text-indigo-600 mb-6">
                        {result.score} / {result.total}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-500 mt-1">
                    {quiz.questions.length} Questions • {quiz.course} {quiz.branch ? `• ${quiz.branch}` : ''}
                </p>
            </div>

            <div className="space-y-6">
                {quiz.questions.map((q: any, index: number) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4">
                            {index + 1}. {q.questionText}
                        </h3>
                        <div className="space-y-2">
                            {q.options.map((option: string, oIndex: number) => (
                                <label
                                    key={oIndex}
                                    className={`flex items-center p-3 rounded-md border cursor-pointer transition ${answers[index] === option
                                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => handleOptionSelect(index, option)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-indigo-700 shadow-md transition transform hover:-translate-y-0.5"
                >
                    Submit Quiz
                </button>
            </div>
        </div>
    );
};

export default TakeQuiz;
