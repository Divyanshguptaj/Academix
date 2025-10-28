import express from 'express';
const router = express.Router();

import { generateSummary } from '../controllers/SmartStudyController.cjs';

router.post('/generateSummary', generateSummary);

export default router;
