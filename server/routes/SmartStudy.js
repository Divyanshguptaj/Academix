import express from 'express';
const router = express.Router();

import { generateSummary, chatWithDocument, askDoubt } from '../controllers/SmartStudyController.cjs';

router.post('/generateSummary', generateSummary);
router.post('/chatWithDocument', chatWithDocument);
router.post('/askDoubt', askDoubt);

export default router;
