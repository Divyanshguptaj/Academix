import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authenticateAdmin = async (req, res, next) => {
    try {
        let token = req.cookies.token || req.body.token;

        if (!token && req.header("Authorization")) {
            token = req.header("Authorization").replace("Bearer", "").trim();
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token missing",
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (decode.accountType !== "Admin") {
                return res.status(400).json({
                    success: false,
                    message: "This is a protected route for Admin only",
                });
            }
            req.user = decode;
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Token is Invalid",
            });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Something went wrong while validating Token",
        });
    }
};