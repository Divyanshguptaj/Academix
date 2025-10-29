import express from 'express';
const router = express.Router();

import smartStudyController from '../controllers/SmartStudyController.cjs';
const { generateSummary, chatWithDocument, askDoubt, summarizeYouTubeVideo } = smartStudyController;

router.post('/generateSummary', generateSummary);
router.post('/chatWithDocument', chatWithDocument);
router.post('/askDoubt', askDoubt);
router.post('/summarizeYouTubeVideo', summarizeYouTubeVideo);

export default router;
