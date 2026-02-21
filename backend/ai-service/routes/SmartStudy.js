import express from 'express';
const router = express.Router();

import smartStudyController from '../controllers/SmartStudyController.cjs';
const { generateSummary, chatWithDocument, askDoubt, textToVideoSummarizer, generateJson2Video, checkJson2Status } = smartStudyController;
import { authenticateToken } from '../../shared-utils/middlewares/auth.js';

router.post('/generateSummary', authenticateToken, generateSummary);
router.post('/chatWithDocument', authenticateToken, chatWithDocument);
router.post('/askDoubt', authenticateToken, askDoubt);
// router.post('/textToVideoSummarizer', authenticateToken, textToVideoSummarizer);
router.post('/generateJson2Video', authenticateToken, generateJson2Video);
router.post('/checkJson2Status', authenticateToken, checkJson2Status);

export default router;
