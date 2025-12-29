import express from 'express';
const router = express.Router();

import smartStudyController from '../controllers/SmartStudyController.cjs';
const { generateSummary, chatWithDocument, askDoubt, textToVideoSummarizer, generateJson2Video, checkJson2Status } = smartStudyController;

router.post('/generateSummary', generateSummary);
router.post('/chatWithDocument', chatWithDocument);
router.post('/askDoubt', askDoubt);
router.post('/textToVideoSummarizer', textToVideoSummarizer);
router.post('/generateJson2Video', generateJson2Video);
router.post('/checkJson2Status', checkJson2Status);

export default router;
