import Category from '../models/Category.js';

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
        const allCategory = await Category.find({}, {name: true, description: true});
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
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // 1. Fetch selected category with published courses (without instructor population)
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Selected category not found",
      });
    }

    // 2. Extract instructor IDs from courses
    const instructorIds = selectedCategory.courses.map(course => course.instructor);

    // 3. Call user-service to get instructor details
    let instructorDetails = [];
    if (instructorIds.length > 0) {
      try {
        const instructorResponse = await fetch(
          `http://localhost:4001/user/get-instructors-by-ids?ids=${instructorIds.join(',')}&fields=firstName,lastName,image,additionalDetails`
        );
        
        if (instructorResponse.ok) {
          const instructorData = await instructorResponse.json();
          instructorDetails = instructorData.data || [];
        }
      } catch (error) {
        console.error("Error fetching instructor details:", error);
        // Continue without instructor details if user service is unavailable
      }
    }

    // 4. Merge instructor details with courses
    const coursesWithInstructors = selectedCategory.courses.map(course => {
      const instructor = instructorDetails.find(inst => inst._id.toString() === course.instructor.toString());
      return {
        ...course.toObject(),
        instructor: instructor || course.instructor
      };
    });

    // 5. Update selectedCategory with courses that have instructor details
    const selectedCategoryWithInstructors = {
      ...selectedCategory.toObject(),
      courses: coursesWithInstructors
    };

    // 6. Fetch all other categories except the selected one
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const randomIndex = getRandomInt(categoriesExceptSelected.length);
      const randomCategoryId = categoriesExceptSelected[randomIndex]._id;

      differentCategory = await Category.findById(randomCategoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
    }

    // 7. Fetch top-selling courses across all categories (without instructor population)
    const allCategories = await Category.find().populate({
      path: "courses",
      match: { status: "Published" },
    });

    const allCourses = allCategories.flatMap((cat) => cat.courses || []);
    const mostSellingCourses = allCourses
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory: selectedCategoryWithInstructors,
        differentCategory: differentCategory || { name: "", courses: [] },
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
