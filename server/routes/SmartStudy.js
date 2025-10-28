import express from 'express';
const router = express.Router();

import { generateSummary, chatWithDocument } from '../controllers/SmartStudyController.cjs';

router.post('/generateSummary', generateSummary);
router.post('/chatWithDocument', chatWithDocument);

export default router;
