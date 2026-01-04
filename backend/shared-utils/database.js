import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates a database connection for a specific service
 * @param {string} serviceName - Name of the service (e.g., 'user_service', 'course_service')
 * @returns {function} Database connection function
 */
const createDatabaseConnection = (serviceName) => {
    return () => {
        const serviceEnvVar = `${serviceName.toUpperCase()}_MONGODB_URL`;
        const mongoUrl = process.env[serviceEnvVar] ||
                         `${process.env.MONGODB_URL}_${serviceName}`;

        mongoose.connect(mongoUrl)
            .then(() => {
                console.log(`${serviceName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: Connected to MongoDB Successfully`);
            })
            .catch((err) => {
                console.log(`${serviceName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: Connection failed`);
                console.log(err);
                process.exit(1);
            });
    };
};

export default createDatabaseConnection;
