const Quiz = require('../models/Quiz');
const Student = require('../models/Student');

const createQuiz = async (req, res) => {
    const { title, courseId, questions, branch } = req.body;
    const newQuiz = new Quiz({
        title,
        courseId,
        questions,
        branch,
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

module.exports = { createQuiz, getQuizzes, getQuiz, submitQuiz, deleteQuiz, getQuizResults };
