import subSection from '../models/SubSection.js'
import Section from '../models/Section.js'
import Course from '../models/Course.js'
import cloudinary from '../../shared-utils/imageUploader.js'

const populatedCourse = (courseId) =>
  Course.findById(courseId)
    .populate({ path: "courseContent", populate: { path: "subSection" } })
    .populate("instructor")
    .populate("category")
    .exec()

export const getUploadSignature = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    })
    const timestamp = Math.round(Date.now() / 1000)
    const folder = "Study-Notion"
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.API_SECRET
    )
    return res.status(200).json({
      success: true,
      data: { signature, timestamp, cloudName: process.env.CLOUD_NAME, apiKey: process.env.API_KEY, folder },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not generate upload signature" })
  }
}

export const createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description, courseId, videoURL, timeDuration } = req.body

    if (!title || !sectionId) {
      return res.status(400).json({ success: false, message: "Title and section ID are required" })
    }

    const newSubSection = await subSection.create({
      title,
      timeDuration: timeDuration ? Number(timeDuration) : 0,
      description: description || '',
      videoURL: videoURL || null,
    })

    await Section.findByIdAndUpdate(sectionId, { $push: { subSection: newSubSection._id } }, { new: true })

    const updatedCourse = await populatedCourse(courseId)
    return res.status(200).json({ success: true, message: "New SubSection Added...", data: updatedCourse })
  } catch (error) {
    return res.status(400).json({ success: false, message: "Can't create new SubSection, some error occured ..." })
  }
}

export const reorderSubSections = async (req, res) => {
  try {
    const { sectionId, courseId, subSectionIds } = req.body
    if (!sectionId || !courseId || !Array.isArray(subSectionIds)) {
      return res.status(400).json({ success: false, message: "sectionId, courseId and subSectionIds are required" })
    }
    await Section.findByIdAndUpdate(sectionId, { subSection: subSectionIds })
    const updatedCourse = await populatedCourse(courseId)
    return res.status(200).json({ success: true, data: updatedCourse })
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not reorder lectures" })
  }
}

export const deleteSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, courseId } = req.body

    if (!sectionId || !subSectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields (sectionId, subSectionId, courseId) are required",
      })
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true }
    )

    if (!updatedSection) {
      return res.status(404).json({ success: false, message: "Section not found" })
    }

    await subSection.findByIdAndDelete(subSectionId)

    const updatedCourse = await populatedCourse(courseId)
    return res.status(200).json({ success: true, message: "SubSection deleted successfully", data: updatedCourse })
  } catch (error) {
    console.log("Error deleting subsection:", error)
    return res.status(500).json({ success: false, message: "Error deleting subsection, please try again" })
  }
}

export const updateSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId, courseId, title, description, videoURL, timeDuration } = req.body

    if (!subSectionId || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields (subSectionId, sectionId, courseId) are required",
      })
    }

    const SubSection = await subSection.findById(subSectionId)
    if (!SubSection) {
      return res.status(404).json({ success: false, message: "SubSection not found" })
    }

    if (title !== undefined) SubSection.title = title
    if (description !== undefined) SubSection.description = description
    if (videoURL !== undefined) {
      SubSection.videoURL = videoURL
      if (timeDuration !== undefined) SubSection.timeDuration = Number(timeDuration)
    }

    await SubSection.save()

    const updatedCourse = await populatedCourse(courseId)
    return res.status(200).json({ success: true, message: "SubSection updated successfully", data: updatedCourse })
  } catch (error) {
    console.error("Error updating subsection:", error)
    return res.status(500).json({ success: false, message: "Error updating subsection, please try again" })
  }
}
