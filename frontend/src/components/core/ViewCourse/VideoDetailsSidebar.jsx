import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import IconBtn from "../../common/IconBtn"

export default function VideoDetailsSidebar({ setReviewModal }) { 
  const [activeStatus, setActiveStatus] = useState("")
  const [videoBarActive, setVideoBarActive] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { sectionId, subSectionId } = useParams()
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse)

  // Check if mobile screen with improved breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSidebarOpen && isMobile) {
        setIsSidebarOpen(false)
      }
    }

    if (isMobile && isSidebarOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isSidebarOpen])

  useEffect(() => {
    ;(() => {
      if (!courseSectionData.length) return
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId)
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
      setVideoBarActive(activeSubSectionId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, courseEntireData, location.pathname])

  const handleSubSectionClick = (course, topic) => {
    navigate(
      `/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`
    )
    setVideoBarActive(topic._id)
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  const sidebarContent = (
    <div className={`flex h-full flex-col fixed left-[-2rem] top-[2rem] bg-richblack-800 border-r-[1px] border-r-richblack-700 ${
      isMobile ? 'w-64 sm:w-64' : 'w-64 xl:w-72'
    } ${isMobile ? 'fixed top-[3rem] left-0' : 'relative'}`}>
      {/* Header */}
      <div className={`mx-3 sm:mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-4 sm:py-5 text-lg font-bold text-richblack-300 ${
        isMobile ? 'pt-6' : ''
      }`}>
        <div className="flex w-full items-center justify-between">
          <div
            onClick={() => {
              navigate(`/dashboard/enrolled-courses`)
            }}
            className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-slate-600 p-1 text-richblack-300 hover:scale-90 cursor-pointer transition-transform duration-200"
            title="back"
          >
            <IoIosArrowBack size={25} />
          </div>
          
          {/* Mobile close button - Fixed */}
          {isMobile && (
            <button
              onClick={handleCloseSidebar}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-slate-600 p-1 text-richblack-300 hover:scale-90 hover:bg-slate-500 transition-all duration-200 lg:hidden"
              title="Close"
              aria-label="Close sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <div className={`${isMobile ? 'hidden xs:block' : ''} ml-auto`}>
            <IconBtn
              text="Add Review"
              customClasses="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              onclick={() => setReviewModal(true)}
            />
          </div>
        </div>
        
        <div className="flex flex-col w-full">
          <p className="text-white text-sm sm:text-base lg:text-lg truncate pr-2 leading-tight">
            {courseEntireData?.courseName}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-richblack-300 mt-1">
            {completedLectures?.length} / {totalNoOfLectures} completed
          </p>
        </div>
        
        {/* Mobile Review Button */}
        {isMobile && (
          <div className="w-full xs:hidden">
            <IconBtn
              text="Add Review"
              customClasses="text-xs px-3 py-2 w-full justify-center"
              onclick={() => setReviewModal(true)}
            />
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)] overflow-y-auto text-white scrollbar-thin scrollbar-thumb-richblack-600 scrollbar-track-richblack-800">
        {courseSectionData.map((course, index) => (
          <div
            className="mt-2 cursor-pointer text-sm text-richblack-300"
            onClick={() => setActiveStatus(course?._id)}
            key={index}
          >
            {/* Section */}
            <div className="flex flex-row justify-between bg-richblack-600 px-3 sm:px-5 py-3 sm:py-4 hover:bg-richblack-500 transition-colors duration-200">
              <div className="w-[70%] font-semibold text-xs sm:text-sm truncate pr-2">
                {course?.sectionName}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`${
                    activeStatus === course?._id
                      ? "rotate-0"
                      : "rotate-180"
                  } transition-all duration-300 text-richblack-200`}
                >
                  <BsChevronDown />
                </span>
              </div>
            </div>

            {/* Sub Sections */}
            {activeStatus === course?._id && (
              <div className="transition-all duration-300 ease-in-out">
                {course.subSection.map((topic, i) => (
                  <div
                    className={`flex gap-3 px-3 sm:px-5 py-2 sm:py-3 cursor-pointer transition-all duration-200 ${
                      videoBarActive === topic._id
                        ? "bg-yellow-200 font-semibold text-richblack-800 border-l-4 border-yellow-500"
                        : "hover:bg-richblack-700 text-richblack-200 hover:text-white"
                    } `}
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubSectionClick(course, topic)
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={completedLectures.includes(topic?._id)}
                      onChange={() => {}}
                      className="mt-1 flex-shrink-0 accent-yellow-500"
                      readOnly
                    />
                    <span className="text-xs sm:text-sm leading-relaxed break-words">
                      {topic.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button - Enhanced */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-16 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-richblack-800 text-white shadow-lg hover:bg-richblack-700 transition-all duration-200 lg:hidden border border-richblack-600"
          aria-label="Open course menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Mobile Overlay - Enhanced */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar Container - Enhanced */}
      <div
        className={`${
          isMobile 
            ? `fixed left-0 top-0 z-10 h-full transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64 xl:w-72 flex-shrink-0 relative'
        }`}
      >
        {(isMobile ? isSidebarOpen : true) && sidebarContent}
      </div>
    </>
  )
}