import Discussion from '../models/Discussion.js';
import { getIo } from '../socket.js';

// Decode HTML entities stored in URLs (e.g. &#x2F; → /)
const decodeHtmlEntities = (str) => {
  if (!str) return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};

// GET /discussion/:courseId — fetch all discussions for a course
export const getDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const discussions = await Discussion.find({ courseId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Discussions fetched successfully',
      data: { discussions },
    });
  } catch (error) {
    console.error('getDiscussions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
  }
};

// POST /discussion/:courseId — create a new discussion post
export const createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    const user = req.user;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const discussion = await Discussion.create({
      courseId,
      author:      user._id,
      authorName:  `${user.firstName} ${user.lastName}`,
      authorImage: decodeHtmlEntities(user.image),
      authorRole:  user.accountType,
      title:       title.trim(),
      content:     content.trim(),
      replies:     [],
    });

    // Emit real-time event to everyone in the course room
    const io = getIo();
    if (io) {
      io.to(courseId).emit('discussion:created', { courseId, discussion });
    }

    return res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: { discussion },
    });
  } catch (error) {
    console.error('createDiscussion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create discussion' });
  }
};

// DELETE /discussion/:discussionId — delete a discussion post
export const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const user = req.user;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const isOwner = discussion.author.toString() === user._id.toString();
    const isPrivileged = user.accountType !== 'Student';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this discussion' });
    }

    await Discussion.findByIdAndDelete(discussionId);

    return res.status(200).json({ success: true, message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('deleteDiscussion error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete discussion' });
  }
};

// POST /discussion/:discussionId/replies — add a reply to a discussion
export const addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const reply = {
      author:      user._id,
      authorName:  `${user.firstName} ${user.lastName}`,
      authorImage: decodeHtmlEntities(user.image),
      authorRole:  user.accountType,
      content:     content.trim(),
    };

    discussion.replies.push(reply);
    await discussion.save();

    const newReply = discussion.replies[discussion.replies.length - 1];

    // Emit real-time event
    const io = getIo();
    if (io) {
      io.to(discussion.courseId.toString()).emit('reply:added', {
        courseId: discussion.courseId.toString(),
        discussionId,
        reply: newReply,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { reply: newReply },
    });
  } catch (error) {
    console.error('addReply error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

// DELETE /discussion/:discussionId/replies/:replyId — delete a reply
export const deleteReply = async (req, res) => {
  try {
    const { discussionId, replyId } = req.params;
    const user = req.user;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const reply = discussion.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const isOwner = reply.author.toString() === user._id.toString();
    const isPrivileged = user.accountType !== 'Student';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reply' });
    }

    reply.deleteOne();
    await discussion.save();

    return res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('deleteReply error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete reply' });
  }
};
