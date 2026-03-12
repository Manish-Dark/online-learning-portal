const Quiz = require('../models/Quiz');
const Student = require('../models/Student');

const createQuiz = async (req, res) => {
    const { title, courseId, course, questions, branch } = req.body;

    const newQuiz = new Quiz({
        title,
        courseId,
        course,
        questions,
        branch,
        createdBy: req.userId,
        createdAt: new Date().toISOString()
    });
    try {
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (error) {
        console.error('Create Quiz Error:', error);
        res.status(409).json({ message: error.message });
    }
}

const getQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { course, branch } = req.query;
        const userId = req.userId;
        const userRole = req.userRole;

        let query = {};

        if (courseId && courseId !== 'undefined' && courseId !== 'null') {
            if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
                query.courseId = courseId;
            }
        }

        if (course) query.course = course;
        if (branch) query.branch = branch;

        if (userRole === 'teacher') {
            query.createdBy = userId;
        }

        let quizzes = await Quiz.find(query).sort({ createdAt: -1 });

        if (userRole === 'student') {
            const student = await Student.findById(userId);
            if (student) {
                const completedQuizIds = student.progress.reduce((acc, p) => {
                    return acc.concat(p.quizScores.map(q => q.quizId.toString()));
                }, []);

                quizzes = quizzes.filter(q => !completedQuizIds.includes(q._id.toString()));
            }
        }

        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findById(id);
        res.status(200).json(quiz);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const submitQuiz = async (req, res) => {
    const { quizId, answers } = req.body;
    const userId = req.userId;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const student = await Student.findById(userId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        let targetProgressIndex = -1;

        // Try to match specific course progress
        if (quiz.courseId) {
            targetProgressIndex = student.progress.findIndex(p => p.courseId && p.courseId.toString() === quiz.courseId.toString());
        }

        // If match found, push there. Else push new entry.
        if (targetProgressIndex !== -1) {
            student.progress[targetProgressIndex].quizScores.push({ quizId, score });
        } else {
            student.progress.push({
                quizScores: [{ quizId, score }]
            });
        }

        await student.save();

        res.status(200).json({ score, total: quiz.questions.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        await Quiz.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuizResults = async (req, res) => {
    try {
        const { id } = req.params; // quizId

        // Find students who have a score for this quizId
        const students = await Student.find({
            'progress.quizScores.quizId': id
        }).select('name email fatherName motherName progress');

        const results = students.map(student => {
            // Find the specific score entry for this quiz
            // Handling potential multiple entries (taking latest or highest? Let's take latest for now)
            // Flatten quizScores from all progress entries
            const allScores = student.progress.flatMap(p => p.quizScores);
            const quizScoreEntry = allScores.filter(qs => qs.quizId.toString() === id).pop(); // Get last one

            return {
                studentId: student._id,
                name: student.name,
                email: student.email,
                fatherName: student.fatherName,
                motherName: student.motherName,
                score: quizScoreEntry ? quizScoreEntry.score : 0
            };
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const parseQuizPDF = async (req, res) => {
    try {
        console.log('--- PDF Parse Request Received ---');
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }
        console.log('File received:', req.file.originalname, 'Size:', req.file.size);

        // Polyfill DOMMatrix for Vercel/Serverless environments
        if (typeof global.DOMMatrix === 'undefined') {
            global.DOMMatrix = class DOMMatrix {
                constructor() {
                    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
                }
            };
        }

        const pdfParseModule = require('pdf-parse');
        const PDFParse = pdfParseModule.PDFParse || (pdfParseModule.default && pdfParseModule.default.PDFParse) || pdfParseModule;
        
        if (typeof PDFParse !== 'function') {
            throw new Error('PDFParse is not a constructor/function. Module structure: ' + Object.keys(pdfParseModule).join(', '));
        }

        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        const text = result.text;
        await parser.destroy();

        console.log('PDF text extracted, length:', text.length);

        const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
        let title = '';
        const questions = [];
        let currentQuestion = null;

        lines.forEach(line => {
             // Title detection
            if (line.toLowerCase().startsWith('title:') || (title === '' && !line.match(/^Q?\d+[:.)]/i) && questions.length === 0)) {
                if (line.toLowerCase().startsWith('title:')) {
                    title = line.split(':')[1].trim();
                } else if (title === '') {
                    title = line;
                } else {
                    title += ' ' + line;
                }
            } 
            // Question detection: 1. or Q1. or 1)
            else if (line.match(/^Q?\d+[:.)]/i)) {
                if (currentQuestion) questions.push(currentQuestion);
                currentQuestion = {
                    questionText: line.replace(/^Q?\d+[:.)]/i, '').trim(),
                    options: [],
                    correctAnswer: '',
                    lastOptionLetter: ''
                };
            } 
            // Option detection: A) or (A) or A.
            else if (line.match(/^([A-D])[:.)]/i)) {
                const match = line.match(/^([A-D])[:.)]/i);
                const letter = match[1].toUpperCase();
                const optionText = line.replace(/^([A-D])[:.)]/i, '').trim();
                if (currentQuestion) {
                    currentQuestion.options.push(optionText);
                    currentQuestion.lastOptionLetter = letter;
                }
            }
            // Multiple options on one line: (A) X (B) Y
            else if (line.match(/\([A-D]\)/i)) {
                 const parts = line.split(/\([A-D]\)/i).filter(p => p.trim() !== '');
                 const optionLetters = line.match(/\([A-D]\)/gi);
                 if (currentQuestion && optionLetters) {
                     optionLetters.forEach((letter, idx) => {
                         if (parts[idx]) {
                             currentQuestion.options.push(parts[idx].trim());
                             currentQuestion.lastOptionLetter = letter.replace(/[()]/g, '').toUpperCase();
                         }
                     });
                 }
            }
            // Answer detection: Answer: Option B or Answer: B
            else if (line.toLowerCase().includes('answer:')) {
                if (currentQuestion) {
                    const ansPart = line.split(/answer:/i)[1].trim();
                    const letterMatch = ansPart.match(/([A-D])/i);
                    if (letterMatch) {
                        const letter = letterMatch[1].toUpperCase();
                        const letterIndex = letter.charCodeAt(0) - 65; // A=0, B=1, ...
                        if (currentQuestion.options[letterIndex]) {
                            currentQuestion.correctAnswer = currentQuestion.options[letterIndex];
                        } else {
                            currentQuestion.correctAnswer = ansPart; // Fallback
                        }
                    } else {
                        currentQuestion.correctAnswer = ansPart;
                    }
                }
            }
            // Continuation of question or options
            else if (currentQuestion) {
                if (currentQuestion.options.length === 0) {
                    currentQuestion.questionText += ' ' + line;
                } else {
                    // Continuation of last option
                    currentQuestion.options[currentQuestion.options.length - 1] += ' ' + line;
                }
            }
        });

        if (currentQuestion) questions.push(currentQuestion);

        // Sanitize Title
        const sanitizedTitle = title.replace(/Multiple Choice Questions.*/i, '').replace(/Practice Set.*/i, '').replace(/Questions \|.*/i, '').trim();

        // Ensure every question has 4 options
        questions.forEach(q => {
            delete q.lastOptionLetter;
            while (q.options.length < 4) q.options.push('');
        });

        res.status(200).json({ title: sanitizedTitle || 'Parsed Quiz', questions });
    } catch (error) {
        console.error('PDF Parse Error:', error);
        res.status(500).json({ message: 'Failed to parse PDF', error: error.message });
    }
};

module.exports = { createQuiz, getQuizzes, getQuiz, submitQuiz, deleteQuiz, getQuizResults, parseQuizPDF };
