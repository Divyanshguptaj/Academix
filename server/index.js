import express from 'express';
const app = express();

import userRoutes from './routes/User.js';
import profileRoutes from './routes/Profile.js';
import paymentRoutes from './routes/Payments.js';
import courseRoutes from './routes/Course.js';
import contactRoutes from './routes/Contact.js';
import smartStudyRoutes from './routes/SmartStudy.js';

import database from './config/database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { cloudinaryConnect } from './config/cloudinary.js';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;
database(); // If you're using `export default connect`, just call it directly

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://academix-w1rw.onrender.com",
        "https://academix-sigma.vercel.app"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));

app.use(fileUpload({ useTempFiles: false }));
cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/smartStudy", smartStudyRoutes);

//def routes
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Your server is up and running...",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
