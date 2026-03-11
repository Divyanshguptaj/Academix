import express from 'express';
import { authorize } from '../../shared-utils/middlewares/auth.js';
import {
  getDiscussions,
  createDiscussion,
  deleteDiscussion,
  addReply,
  deleteReply,
} from '../controllers/Discussion.js';

const router = express.Router();

// All routes require authentication (enrolled students, instructors, admins)
router.get('/:courseId',                               authorize('Student', 'Instructor', 'Admin'), getDiscussions);
router.post('/:courseId',                              authorize('Student', 'Instructor', 'Admin'), createDiscussion);
router.delete('/:discussionId',                        authorize('Student', 'Instructor', 'Admin'), deleteDiscussion);
router.post('/:discussionId/replies',                  authorize('Student', 'Instructor', 'Admin'), addReply);
router.delete('/:discussionId/replies/:replyId',       authorize('Student', 'Instructor', 'Admin'), deleteReply);

export default router;
