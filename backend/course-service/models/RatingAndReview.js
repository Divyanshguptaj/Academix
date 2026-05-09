import mongoose from 'mongoose'

const ratingAndReviews = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
    },
    rating: {
        type : Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    }
})

// Covers duplicate-review check (findOne({ user, course })) and reviews-by-course queries
ratingAndReviews.index({ course: 1, user: 1 });

export default mongoose.model("RatingAndReview",ratingAndReviews);
