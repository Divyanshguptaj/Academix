import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Page Title */}
            <h1 className="mb-8 sm:mb-10 lg:mb-14 text-2xl sm:text-3xl lg:text-4xl font-medium text-richblack-300 leading-tight">
              Add Course
            </h1>
            
            {/* Course Creation Steps */}
            <div className="w-full">
              <RenderSteps />
            </div>
          </div>
          
          {/* Course Upload Tips Sidebar */}
          <div className="w-full xl:w-[400px] xl:flex-shrink-0">
            {/* Mobile: Collapsible Tips Section */}
            <div className="xl:sticky xl:top-6">
              <div className="rounded-lg border border-richblack-600 bg-richblack-800 p-4 sm:p-6 shadow-lg">
                {/* Tips Header */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg sm:text-xl">⚡</span>
                  <h2 className="text-lg sm:text-xl font-medium text-richblack-300">
                    Course Upload Tips
                  </h2>
                </div>
                
                {/* Tips List */}
                <div className="space-y-3 sm:space-y-4">
                  <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-richblack-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Set the Course Price option or make it free.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Standard size for the course thumbnail is 1024x576.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Video section controls the course overview video.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Course Builder is where you create & organize a course.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>
                        Add Topics in the Course Builder section to create lessons,
                        quizzes, and assignments.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>
                        Information from the Additional Data section shows up on the
                        course single page.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Make Announcements to notify any important updates.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-richblack-400 mt-1 flex-shrink-0">•</span>
                      <span>Send Notes to all enrolled students at once.</span>
                    </li>
                  </ul>
                </div>

                {/* Additional Help Section */}
                <div className="mt-6 pt-6 border-t border-richblack-600">
                  <p className="text-xs sm:text-sm text-richblack-400 text-center">
                    Need help? Check our 
                    <span className="text-caribbeangreen-300 hover:text-caribbeangreen-200 cursor-pointer ml-1">
                      course creation guide
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Spacing */}
        <div className="h-6 xl:hidden"></div>
      </div>
    </div>
  )
}