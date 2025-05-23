const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                error: true,
                message: 'Unauthorized or No token found',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                warning: true,
                message: 'You are not authorized User',
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: true,
            message: 'Internal server error',
        });
    }
};
