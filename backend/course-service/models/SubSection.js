import mongoose from 'mongoose'

const subSectionSchema = new mongoose.Schema({
    title:{
        type: String,
    },
    timeDuration:{
        type: String,
        default: 0,
    },
    description:{
        type: String,
    },
    videoURL:{
        type: String,
    },
})

export default mongoose.model('SubSection', subSectionSchema);
