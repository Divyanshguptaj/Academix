import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const auth = async (req, res, next) => {
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

// Token invalidation on logout
export const invalidateToken = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful. Token has been invalidated."
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed. Please try again."
        });
    }
};

//isStudent
export const isStudent = async (req, res, next)=>{
    try{
        // console.log("here")
        if(req.user.accountType !== "Student"){
            return res.status(400).json({
                success: false,
                message: "This is a protected route for students only",
            })
        }
        next();
    }catch(error){
        return res.status(400).json({
            success: false,
            message: "User role can't verified , please try again later",
        })
    }
}

//isInstructor
export const isInstructor = async (req, res, next)=>{
    try{
        // console.log(req.user)
        if(req.user.accountType !== "Instructor"){
            return res.status(400).json({
                success: false,
                message: "This is a protected route for Instructor only",
            })
        }
        next();
        // console.log("instructor")
    }catch(error){
        return res.status(400).json({
            success: false,
            message: "User role can't verified , please try again later",
        })
    }
}

//isAdmin
export const isAdmin = async (req, res, next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(400).json({
                success: false,
                message: "This is a protected route for Admin only",
            })
        }
        next();
    }catch(error){
        return res.status(400).json({
            success: false,
            message: "User role can't verified , please try again later",
        })
    }
}
