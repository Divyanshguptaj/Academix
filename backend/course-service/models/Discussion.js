import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    author:      { type: mongoose.Schema.Types.ObjectId, required: true },
    authorName:  { type: String, required: true },
    authorImage: { type: String },
    authorRole:  { type: String },
    content:     { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    author:      { type: mongoose.Schema.Types.ObjectId, required: true },
    authorName:  { type: String, required: true },
    authorImage: { type: String },
    authorRole:  { type: String },
    title:       { type: String, required: true, trim: true },
    content:     { type: String, required: true, trim: true },
    replies:     [replySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Discussion', discussionSchema);
