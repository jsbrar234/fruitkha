const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                statusCode: 401,
                message: "Please Login Your Account"
            });
        }

        let token=req.header("Authorization");
        const decoded = jwt.verify(token, 'login');
        req.userId = decoded.userId;
        next();
        
    } catch (error) {
        return res.status(401).json({
            statusCode: 401,
            message: "Invalid or expired token"
        });
    }
};

module.exports = auth;