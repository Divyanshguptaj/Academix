import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import "video-react/dist/video-react.css";
import { useLocation } from "react-router-dom";
import { BigPlayButton, Player } from "video-react";
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import IconBtn from "../../common/IconBtn";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

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
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true;
    } else {
      return false;
    }
  };

  // go to the next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id;
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id;
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length;

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  // go to the previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId);

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      );
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id;
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length;
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      );
    }
  };

  const handleLectureCompletion = async () => {
    setLoading(true);
    console.log("object");
    const res = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId, userId: user._id },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };

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
                <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-gradient-to-t from-black via-black/70 via-black/40 to-black/10 backdrop-blur-sm">
                  <div className="text-center space-y-4 w-full max-w-md">
                    {/* Mark as completed */}
                    {!completedLectures.includes(subSectionId) && (
                      <IconBtn
                        disabled={loading}
                        onClick={() => (onclick = handleLectureCompletion)}
                        text={!loading ? "✅ Mark as Completed" : "Loading..."}
                        customClasses="text-sm sm:text-lg w-full sm:w-auto px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium shadow-md transition-all duration-300 hover:scale-105"
                      />
                    )}

                    {/* Rewatch */}
                    <IconBtn
                      disabled={loading}
                      onClick={() => {
                        if (playerRef?.current) {
                          playerRef?.current?.seek(0);

                          playerRef.current.play();
                          setVideoEnded(false);
                        }
                      }}
                      text="🔁 Rewatch"
                      customClasses="text-sm sm:text-lg w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-all duration-300 hover:scale-105"
                    />

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5 pt-4">
                      {!isFirstVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToPrevVideo}
                          className="px-5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium shadow-md transition-all duration-300 hover:scale-105"
                        >
                          ⬅️ Previous
                        </button>
                      )}
                      {!isLastVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToNextVideo}
                          className="px-5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium shadow-md transition-all duration-300 hover:scale-105"
                        >
                          Next ➡️
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
  );
};

export default VideoDetails;
