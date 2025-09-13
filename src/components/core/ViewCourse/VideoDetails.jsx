import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import "video-react/dist/video-react.css"
import { useLocation } from "react-router-dom"
import { BigPlayButton, Player } from "video-react"
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../common/IconBtn"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      if (!courseSectionData?.length) return;

      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`);
        return;
      }

      const filteredData = courseSectionData.find(
        (course) => course._id === sectionId
      );

      const filteredVideoData = filteredData?.subSection?.find(
        (data) => data._id === subSectionId
      );

      if (filteredVideoData) {
        setVideoData(filteredVideoData);
      } else {
        setVideoData(null);
      }

      setPreviewSource(courseEntireData?.thumbnail || "");
      setVideoEnded(false);
    })();
  }, [courseSectionData, courseEntireData, location.pathname]);

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId, userId: user._id },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-5 text-white w-full lg:pr-8 sm:pr-4 md:pr:4">
      <div className="relative">
        {!videoData ? (
          <img
            src={previewSource}
            alt="Preview"
            className="h-48 sm:h-64 md:h-80 lg:h-96 w-full rounded-md object-cover"
          />
        ) : (
          <div className="relative aspect-video">
            <Player
              ref={playerRef}
              aspectRatio="16:9"
              playsInline
              onEnded={() => setVideoEnded(true)}
              src={videoData?.videoURL}
              className="w-full h-full"
            >
              <BigPlayButton position="center" />
              {/* Render When Video Ends */}
              {videoEnded && (
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                  }}
                  className="absolute inset-0 z-9 flex items-center justify-center font-inter p-4"
                >
                  <div className="text-center space-y-3 w-full max-w-md">
                    {!completedLectures.includes(subSectionId) && (
                      <IconBtn
                        disabled={loading}
                        onclick={() => handleLectureCompletion()}
                        text={!loading ? "Mark As Completed" : "Loading..."}
                        customClasses="text-sm sm:text-lg w-full sm:w-auto px-3 sm:px-4 py-2"
                      />
                    )}
                    <IconBtn
                      disabled={loading}
                      onclick={() => {
                        if (playerRef?.current) {
                          playerRef?.current?.seek(0)
                          setVideoEnded(false)
                        }
                      }}
                      text="Rewatch"
                      customClasses="text-sm sm:text-lg w-full sm:w-auto px-3 sm:px-4 py-2 mt-2"
                    />
                    <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-sm sm:text-base pt-4">
                      {!isFirstVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToPrevVideo}
                          className="blackButton px-4 py-2 rounded text-white bg-richblack-700 hover:bg-richblack-600 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      {!isLastVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToNextVideo}
                          className="blackButton px-4 py-2 rounded text-white bg-richblack-700 hover:bg-richblack-600 transition-colors"
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Player>
          </div>
        )}
      </div>

      <div className="space-y-2 px-2 sm:px-0">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
          {videoData?.title}
        </h1>
        <p className="text-sm sm:text-base text-richblack-300 pt-2 pb-6 leading-relaxed">
          {videoData?.description}
        </p>
      </div>
    </div>
  )
}

export default VideoDetails
