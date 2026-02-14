import React, { useState } from 'react';
import API from '../api';

interface QuizProps {
    quiz: any;
    onClose: () => void;
}

const TakeQuiz: React.FC<QuizProps> = ({ quiz, onClose }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [score, setScore] = useState<number | null>(null);

    const handleSubmit = async () => {
        try {
            // Transform answers to array
            const answerArray = quiz.questions.map((_: any, index: number) => answers[index] || '');
            const { data } = await API.post('/quizzes/submit', { quizId: quiz._id, answers: answerArray });
            setScore(data.score);
        } catch (error) {
            console.error(error);
        }
    };

    if (score !== null) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
                <div className="text-5xl font-bold text-primary mb-2">{score} / {quiz.questions.length}</div>
                <p className="text-gray-600 mb-6">Score: {Math.round((score / quiz.questions.length) * 100)}%</p>
                <button onClick={onClose} className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700">Close</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{quiz.title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q: any, qIndex: number) => (
                    <div key={qIndex}>
                        <h4 className="font-semibold text-lg mb-3">{qIndex + 1}. {q.questionText}</h4>
                        <div className="space-y-2">
                            {q.options.map((opt: string, oIndex: number) => (
                                <label key={oIndex} className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name={`question-${qIndex}`}
                                        value={opt}
                                        onChange={() => setAnswers({ ...answers, [qIndex]: opt })}
                                        checked={answers[qIndex] === opt}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="mt-8 w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition"
            >
                Submit Answers
            </button>
        </div>
    );
};

export default TakeQuiz;
