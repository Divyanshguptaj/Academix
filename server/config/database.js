import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("Connected Successfully");
        })
        .catch((err) => {
            console.log("Connection failed");
            console.log(err);
            process.exit(1);
        });
};

export default connect;
