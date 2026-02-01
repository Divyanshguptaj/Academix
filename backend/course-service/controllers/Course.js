import Course from '../models/Course.js'
import Category from '../models/Category.js'
import Section from "../models/Section.js"
import SubSection from "../models/SubSection.js"
import { uploadImagetoCloudinary } from '../../shared-utils/imageUploader.js'
import axios from 'axios'
import mongoose from 'mongoose'

import dotenv from 'dotenv';
dotenv.config();

export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            email,
            status = "Draft",
        } = req.body;

        let tags = req.body.tag ? JSON.parse(req.body.tag) : [];
        let instructions = req.body.instructions ? JSON.parse(req.body.instructions) : [];
        const thumbnail = req.files?.thumbnailImage;

        // Validate status
        const validStatuses = ["Draft", "Published"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course status provided",
            });
        }

        // Find existing course
        const existingCourse = await Course.findById(courseId);
        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Upload new thumbnail if provided
        let updatedThumbnail = existingCourse.thumbnail;
        if (thumbnail) {
            const uploadDetails = await uploadImagetoCloudinary(thumbnail, "Study-Notion");
            updatedThumbnail = uploadDetails.secure_url;
        }

        // Update course details
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                courseName: courseName || existingCourse.courseName,
                courseDescription: courseDescription || existingCourse.courseDescription,
                whatYouWillLearn: whatYouWillLearn || existingCourse.whatYouWillLearn,
                price: price || existingCourse.price,
                category: category || existingCourse.category,
                status: status || existingCourse.status,
                tag: tags.length > 0 ? tags : existingCourse.tag,
                instructions: instructions.length > 0 ? instructions : existingCourse.instructions,
                thumbnail: updatedThumbnail,
            },
            { new: true }
        )
        .populate("category")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        });

        // Get instructor details via user-service
        let instructorDetails = null;
        if (updatedCourse.instructor) {
            try {
                const instructorResponse = await fetch(
                    `http://localhost:4001/user/get-instructors-by-ids?ids=${updatedCourse.instructor}&fields=firstName,lastName,image,additionalDetails`
                );
                
                if (instructorResponse.ok) {
                    const instructorData = await instructorResponse.json();
                    instructorDetails = instructorData.data && instructorData.data[0];
                }
            } catch (error) {
                console.error("Error fetching instructor details:", error);
                // Continue without instructor details if user service is unavailable
            }
        }

        // Merge instructor details with course data
        const result = {
            ...updatedCourse.toObject(),
            instructor: instructorDetails || updatedCourse.instructor,
        };

        return res.status(200).json({
            success: true,
            message: "Course details updated successfully",
            data: result,
        });

    } catch (error) {
        console.error("Error updating course details:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating course details, please try again",
        });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, category, email, status = "Draft" } = req.body;
        const thumbnail = req.files?.thumbnailImage;
        let tags = req.body.tag ? JSON.parse(req.body.tag) : []; // Parse tags properly
        let instructions = req.body.instructions ? JSON.parse(req.body.instructions) : [];

        // Validate required fields
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tags.length || !instructions.length) {
            return res.status(400).json({
                success: false,
                message: "Fields can't be empty..."
            });
        }

        // Find instructor details via User Service API
        let instructorDetails;
        try {
            const userResponse = await axios.get(`http://localhost:4001/auth/user-by-email/${email}`);
            if (!userResponse.data.success) {
                return res.status(400).json({
                    success: false,
                    message: "Can't find instructor details..."
                });
            }
            instructorDetails = userResponse.data.user;
        } catch (error) {
            console.error("Error calling User Service:", error.message);
            return res.status(500).json({
                success: false,
                message: "Error communicating with User Service"
            });
        }

        // Find category details
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Can't find category..."
            });
        }

        // Upload course thumbnail to Cloudinary
        const thumbnailImage = await uploadImagetoCloudinary(thumbnail, "Study-Notion");
        // console.log("Cloudinary Response:", thumbnailImage);

        // Create new course
        let newCourse;
        try {
            newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor: instructorDetails._id,
                whatYouWillLearn,
                price,
                category,
                thumbnail: thumbnailImage.secure_url,
                tag: tags,
                instructions: instructions,
                status: status,
            });

            // Update instructor by adding the new course via User Service API
            try {
                await axios.post('http://localhost:4001/profile/add-course', {
                    userId: instructorDetails._id,
                    courseId: newCourse._id
                });
            } catch (error) {
                console.error("Error updating instructor courses:", error.message);
                // Don't fail the course creation, but log the error
            }

            // ✅ Update category by adding the new course
            await Category.findByIdAndUpdate(
                category,
                { $push: { courses: newCourse._id } },
                { new: true }
            );

        } catch (error) {
            // console.log("Can't create the course:", error);
            return res.status(400).json({
                success: false,
                message: "Can't create the course, please try again",
            });
        }

        return res.status(200).json({
            success: true,
            message: "New Course Added...",
            data: newCourse,
        });

    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            success: false,
            message: "Some error occurred while creating the course, please try again...",
        });
    }
};

export const showAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instuctor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).exec();

        // console.log(allCourses)

        return res.status(200).json({
            success: true,
            message: "All courses shown successfully...",
            data: allCourses,
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: "Some error occured while showing all courses..."
        })
    }
}

export const getCourseDetails = async (req,res)=>{
    try {
        const {courseId} = req.body;
        // console.log("courseID", courseId)
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: "Feilds can't be empty",
            })
        }
        
        // 1. Get course details without studentsEnrolled and instructor population (to avoid Mongoose error)
        const courseDetails = await Course.findById(courseId)
        .populate('ratingAndReviews')
        .populate('category')
        .populate({path: 'courseContent',populate:{path: 'subSection'},}).exec();

        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: "Can't find the course...",
            })
        }

        // 2. Get instructor details via user-service
        let instructorDetails = null;
        if (courseDetails.instructor) {
            try {
                const instructorResponse = await fetch(
                    `http://localhost:4001/user/get-instructors-by-ids?ids=${courseDetails.instructor}&fields=firstName,lastName,image,additionalDetails`
                );
                
                if (instructorResponse.ok) {
                    const instructorData = await instructorResponse.json();
                    console.log("Instructor API response:", instructorData);
                    instructorDetails = instructorData.data && instructorData.data[0];
                } else {
                    console.error("Instructor API returned non-ok status:", instructorResponse.status);
                }
            } catch (error) {
                console.error("Error fetching instructor details:", error);
                // Continue without instructor details if user service is unavailable
            }
        }

        // 3. Get enrolled students details via user-service
        let studentsDetails = [];
        if (courseDetails.studentsEnrolled && courseDetails.studentsEnrolled.length > 0) {
            try {
                const studentsResponse = await fetch(
                    `http://localhost:4001/user/get-instructors-by-ids?ids=${courseDetails.studentsEnrolled.join(',')}&fields=firstName,lastName,image,additionalDetails`
                );
                
                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    studentsDetails = studentsData.data || [];
                }
            } catch (error) {
                console.error("Error fetching students details:", error);
                // Continue without students details if user service is unavailable
            }
        }

        // 4. Merge instructor and students details with course data
        const result = {
            ...courseDetails.toObject(),
            instructor: instructorDetails || courseDetails.instructor,
            studentsEnrolled: studentsDetails || courseDetails.studentsEnrolled,
            success: true
        };
        
        return res.status(200).json({
            success: true,
            message: "Found course details succesfully...",
            data: result
        })

    } catch (error) {
        console.error("Error getting course details:", error);
        return res.status(500).json({
            success: false,
            message: "Can't get course details",
            error: error.message,
        })
    }
}

export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.query.instructorId;

    // Validate the instructorId
    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required",
      });
    }

    const courses = await Course.find({ instructor: instructorId })
      .populate("category")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });

    // Handle no courses found
    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses found for this instructor",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
      error: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Delete all sections and subsections related to this course
        for (const sectionId of course.courseContent) {
            const section = await Section.findById(sectionId);
            if (section) {
                await SubSection.deleteMany({ _id: { $in: section.subSection } });
                await Section.findByIdAndDelete(sectionId);
            }
        }

        // Remove course from instructor's course list via User Service API
        try {
            await axios.post('http://localhost:4001/profile/remove-course', {
                userId: course.instructor,
                courseId: courseId
            });
        } catch (error) {
            console.error("Error removing course from instructor:", error.message);
            // Don't fail the deletion, but log the error
        }

        // Remove course from category
        // if (course.category) {
        //     await Category.findByIdAndUpdate(course.category, {
        //         $pull: { courses: courseId },
        //     });
        // }

        // Finally, delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting course. Please try again.",
        });
    }
};


// Get course details for payment processing (for Payment Service communication)
export const getCourseDetailsForPayment = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId).select('_id courseName price studentsEnrolled');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Error getting course details for payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Enroll student in course (for Payment Service communication)
export const enrollStudentInCourse = async (req, res) => {
  try {
    const { courses, userId } = req.body;

    if (!courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Courses and User ID are required",
      });
    }

    for (const courseData of courses) {
      const courseId = typeof courseData === 'object' ? courseData.courseId : courseData;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.error(`Invalid course ID: ${courseId}`);
        continue;
      }

      const course = await Course.findById(courseId);
      if (!course) {
        console.error(`Course with ID ${courseId} not found`);
        continue;
      }

      const uid = new mongoose.Types.ObjectId(userId);

      // Enroll user in the course if not already enrolled
      if (!course.studentsEnrolled.includes(uid)) {
        course.studentsEnrolled.push(uid);
        await course.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Student enrolled in courses successfully",
    });
  } catch (error) {
    console.error("Error enrolling student in course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get courses by IDs (for User Service communication)
export const getCourseByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Course IDs are required",
      });
    }

    // Split the comma-separated IDs and validate them
    const courseIds = ids.split(',').map(id => id.trim());
    
    // Validate all IDs are valid ObjectIds
    for (const id of courseIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid course ID: ${id}`,
        });
      }
    }

    // Fetch courses with populated courseContent and subSection
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses found for the provided IDs",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error getting courses by IDs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get enrolled students with progress for a course
export const getEnrolledStudentsWithProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Validate courseId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    // Get course details without students population
    const course = await Course.findById(courseId)
      .populate('category')
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get enrolled students details via user-service
    let studentsDetails = [];
    if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
      try {
        const studentsResponse = await fetch(
          `http://localhost:4001/user/get-instructors-by-ids?ids=${course.studentsEnrolled.join(',')}&fields=firstName,lastName,image,additionalDetails`
        );
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          studentsDetails = studentsData.data || [];
        }
      } catch (error) {
        console.error("Error fetching students details:", error);
        // Continue without students details if user service is unavailable
      }
    }

    // Get course progress for each student
    let courseProgressData = [];
    if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
      try {
        courseProgressData = await CourseProgress.find({
          courseID: courseId,
          userId: { $in: course.studentsEnrolled }
        }).populate('completedVideos');
      } catch (error) {
        console.error("Error fetching course progress:", error);
        // Continue without progress data if CourseProgress model issues occur
      }
    }

    // Merge student details with progress data
    const studentsWithProgress = studentsDetails.map(student => {
      const progress = courseProgressData.find(cp => cp.userId.toString() === student._id.toString());
      return {
        ...student,
        progress: progress || { completedVideos: [] }
      };
    });

    return res.status(200).json({
      success: true,
      message: "Enrolled students with progress fetched successfully",
      data: {
        course: {
          _id: course._id,
          courseName: course.courseName,
          category: course.category,
          courseContent: course.courseContent
        },
        enrolledStudents: studentsWithProgress,
        totalEnrolled: course.studentsEnrolled.length
      },
    });
  } catch (error) {
    console.error("Error getting enrolled students with progress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

