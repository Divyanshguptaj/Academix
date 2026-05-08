import express from 'express';
const router = express.Router();

import smartStudyController from '../controllers/SmartStudyController.cjs';
const { generateSummary, chatWithDocument, askDoubt, generateJson2Video, checkJson2Status } = smartStudyController;
import { authenticateToken } from '../../shared-utils/middlewares/auth.js';
import { createRateLimit } from '../../shared-utils/middlewares/inputSanitization.js';

// 20 AI requests per 15 minutes per IP — protects free Gemini quota
const aiRateLimit = createRateLimit(20, 15 * 60 * 1000);

router.post('/generateSummary',    authenticateToken, aiRateLimit, generateSummary);
router.post('/chatWithDocument',   authenticateToken, aiRateLimit, chatWithDocument);
router.post('/askDoubt',           authenticateToken, aiRateLimit, askDoubt);
router.post('/generateJson2Video', authenticateToken, aiRateLimit, generateJson2Video);
router.post('/checkJson2Status',   authenticateToken, checkJson2Status);

export default router;
