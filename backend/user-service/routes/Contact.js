import express from 'express';
import { contactUsController } from '../controllers/Contact.js';
import { 
  sanitizeInput, 
  mongoSanitizeMiddleware,
  createRateLimit
} from '../middlewares/inputSanitization.js';

const router = express.Router();

// Rate limiting for contact form
const contactRateLimit = createRateLimit(3, 15 * 60 * 1000); // 3 attempts per 15 minutes

router.post('/', 
  contactRateLimit,
  sanitizeInput, 
  mongoSanitizeMiddleware, 
  contactUsController
);

export default router;