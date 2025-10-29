import express from 'express';
const router = express.Router();

import smartStudyController from '../controllers/SmartStudyController.cjs';
const { generateSummary, chatWithDocument, askDoubt, summarizeYouTubeVideo, textToVideoSummarizer, generateVideoWithVeo, checkVideoStatus } = smartStudyController;

router.post('/generateSummary', generateSummary);
router.post('/chatWithDocument', chatWithDocument);
router.post('/askDoubt', askDoubt);
router.post('/summarizeYouTubeVideo', summarizeYouTubeVideo);
router.post('/textToVideoSummarizer', textToVideoSummarizer);
router.post('/generateVideoWithVeo', generateVideoWithVeo);
router.post('/checkVideoStatus', checkVideoStatus);

export default router;
