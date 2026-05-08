import Category from '../models/Category.js';
import Course from '../models/Course.js';
import RatingAndReview from '../models/RatingAndReview.js';
import { userService } from '../utils/serviceClients.js'

export const createCategory = async (req, res) =>{
    try{
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Fields can't be empty"
            })
        }

        const catDetails = await Category.create({
            name: name,
            description: description,
        })

        return res.status(200).json({
            success: true,
            message: "Category created successfully...",
        })

    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}

export const findAllCategory = async (req, res)=>{
    try{
        const allCategory = await Category.find({}, {name: true, description: true}).lean();
        return res.status(200).json({
            success: true,
            message: "All categories found successfully...",
            data: allCategory,
        })
    }catch(error){
      const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: "Can't find all categories...",
        })
    }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const categoryPageDetails = async (req, res) => {
  try {
    const { categoryId, searchQuery, page = 1, limit = 8, sortTab = 1, priceFilter = "all" } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // 1. Fetch basic category info
    let categoryInfo;
    if (categoryId === "all") {
      categoryInfo = {
        _id: "all",
        name: "All Courses",
        description: "Browse our entire catalog of high-quality courses across all categories.",
      };
    } else {
      categoryInfo = await Category.findById(categoryId).select("name description");
      if (!categoryInfo) {
        return res.status(404).json({
          success: false,
          message: "Selected category not found",
        });
      }
    }

    // 2. Setup search match condition
    const matchCondition = { status: "Published" };
    if (categoryId !== "all") {
      matchCondition.category = categoryId;
    }

    // Price Filter
    if (priceFilter === "free") {
      matchCondition.price = 0;
    } else if (priceFilter === "paid") {
      matchCondition.price = { $gt: 0 };
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      // Split search into words to allow flexible searching (e.g., "web dev" matches "web development")
      const words = searchQuery.trim().split(/\s+/);
      
      // Use $and so the course must match ALL words typed by the user
      matchCondition.$and = words.map(word => {
        const safeWord = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        return {
          $or: [
            { courseName: { $regex: safeWord, $options: "i" } },
            { courseDescription: { $regex: safeWord, $options: "i" } } // Bonus: searches descriptions too!
          ]
        };
      });
    }

    // 3. Setup sorting (1 = Popular, 2 = Newest)
    const sortCondition = Number(sortTab) === 2 ? { createdAt: -1 } : { sold: -1, createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    // 4. Query Courses directly for true Server-Side Pagination
    const [totalCourses, categoryCourses] = await Promise.all([
      Course.countDocuments(matchCondition),
      Course.find(matchCondition).sort(sortCondition).skip(skip).limit(Number(limit)).populate("ratingAndReviews").exec()
    ]);

    // 5. Extract instructor IDs and fetch instructor details
    const instructorIds = [...new Set(categoryCourses.map(course => course.instructor.toString()))];

    let instructorDetails = [];
    if (instructorIds.length > 0) {
      try {
        const instructorResponse = await userService.get('/auth/get-instructors-by-ids', {
          params: { ids: instructorIds.join(','), fields: 'firstName,lastName,image,additionalDetails' },
        });
        instructorDetails = instructorResponse.data?.data || [];
      } catch (error) {
        console.error("Error fetching instructor details:", error.message);
        // Continue without instructor details if user service is unavailable
      }
    }

    // 6. Merge instructor details
    const coursesWithInstructors = categoryCourses.map(course => {
      const instructor = instructorDetails.find(inst => inst._id.toString() === course.instructor.toString());
      return {
        ...course.toObject(),
        instructor: instructor || course.instructor
      };
    });

    const selectedCategoryWithInstructors = {
      _id: categoryInfo._id,
      name: categoryInfo.name,
      description: categoryInfo.description,
      courses: coursesWithInstructors,
      totalPages: Math.ceil(totalCourses / Number(limit)) || 1,
      currentPage: Number(page),
      totalCourses
    };

    // 7. Fetch top-selling courses globally (Optimized Query)
    const mostSellingCourses = await Course.find({ status: "Published" })
      .sort({ sold: -1, createdAt: -1 })
      .limit(10)
      .populate("ratingAndReviews")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory: selectedCategoryWithInstructors,
        mostSellingCourses: mostSellingCourses || [],
      },
    });
  } catch (error) {
    console.error("Error in categoryPageDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Lightweight endpoint for Global Navbar Search
export const searchAllCourses = async (req, res) => {
  try {
    const { searchQuery } = req.body;
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Pre-fetch categories so we can match against category names
    const allCategories = await Category.find().select('_id name').lean();

    const words = searchQuery.trim().split(/\s+/);
    const matchCondition = { status: "Published" };
    
    matchCondition.$and = words.map((word) => {
      const safeWord = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(safeWord, "i");

      // Find if this specific word matches any category name
      const matchingCategoryIds = allCategories
        .filter((c) => regex.test(c.name))
        .map((c) => c._id);

      const orConditions = [
        { courseName: { $regex: safeWord, $options: "i" } },
        { courseDescription: { $regex: safeWord, $options: "i" } }
      ];

      // If the word matches a category, allow courses from that category to be included
      if (matchingCategoryIds.length > 0) {
        orConditions.push({ category: { $in: matchingCategoryIds } });
      }

      return { $or: orConditions };
    });

    // Only fetch 5 records and limit fields to keep the API blazing fast
    const courses = await Course.find(matchCondition)
      .select("_id courseName thumbnail price")
      .populate("category", "name")
      .limit(5)
      .lean();

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Error in searchAllCourses:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
