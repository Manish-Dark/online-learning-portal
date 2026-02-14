const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log('Auth Middleware Header:', req.headers.authorization);
        if (!req.headers.authorization) return res.status(401).json({ message: 'No authorization header' });

        const token = req.headers.authorization.split(' ')[1];
        const isCustomAuth = token.length < 500;

        let decodedData;

        if (token && isCustomAuth) {
            decodedData = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decodedData?.id;
            req.userRole = decodedData?.role;
            console.log('Decoded Token:', decodedData);
        } else {
            decodedData = jwt.decode(token);
            req.userId = decodedData?.sub;
        }

        next();
    } catch (error) {
        console.log('Auth Middleware Error:', error);
        res.status(401).json({ message: 'Unauthenticated' });
    }
};

const teacherLimit = (req, res, next) => {
    if (req.userRole === 'teacher' || req.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
}

module.exports = { auth, teacherLimit };
