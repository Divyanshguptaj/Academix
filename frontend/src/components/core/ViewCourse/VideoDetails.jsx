import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "video-react/dist/video-react.css";
import { BigPlayButton, Player } from "video-react";
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import {
  MdCheckCircle,
  MdSkipNext,
  MdSkipPrevious,
  MdReplay,
  MdOutlinePlayCircle,
} from "react-icons/md";
import { BiTime } from "react-icons/bi";

const formatDuration = (totalSeconds) => {
  const s = Math.round(totalSeconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  return `${sec}s`;
};

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

  const [videoData, setVideoData] = useState(null);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!courseSectionData?.length) return;
    if (!courseId && !sectionId && !subSectionId) {
      navigate("/dashboard/enrolled-courses");
      return;
    }
    const section = courseSectionData.find((s) => s._id === sectionId);
    const sub = section?.subSection?.find((d) => d._id === subSectionId);
    setVideoData(sub || null);
    setPreviewSource(courseEntireData?.thumbnail || "");
    setVideoEnded(false);
    setDescExpanded(false);
  }, [courseSectionData, courseEntireData, location.pathname]);

  // ── Position helpers ──────────────────────────────────────────────────
  const getLectureInfo = () => {
    let lectureNum = 0;
    let totalLectures = 0;
    let currentSection = null;
    courseSectionData.forEach((section) => {
      section.subSection.forEach((sub) => {
        totalLectures++;
        if (sub._id === subSectionId) {
          lectureNum = totalLectures;
          currentSection = section;
        }
      });
    });
    return { lectureNum, totalLectures, currentSection };
  };

  const isFirstVideo = () => {
    const idx = courseSectionData.findIndex((s) => s._id === sectionId);
    const subIdx = courseSectionData[idx]?.subSection.findIndex(
      (d) => d._id === subSectionId
    );
    return idx === 0 && subIdx === 0;
  };

  const isLastVideo = () => {
    const idx = courseSectionData.findIndex((s) => s._id === sectionId);
    const noOfSubs = courseSectionData[idx]?.subSection.length;
    const subIdx = courseSectionData[idx]?.subSection.findIndex(
      (d) => d._id === subSectionId
    );
    return idx === courseSectionData.length - 1 && subIdx === noOfSubs - 1;
  };

  const goToNextVideo = () => {
    const idx = courseSectionData.findIndex((s) => s._id === sectionId);
    const noOfSubs = courseSectionData[idx].subSection.length;
    const subIdx = courseSectionData[idx].subSection.findIndex(
      (d) => d._id === subSectionId
    );
    if (subIdx !== noOfSubs - 1) {
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${courseSectionData[idx].subSection[subIdx + 1]._id}`
      );
    } else {
      const next = courseSectionData[idx + 1];
      navigate(
        `/view-course/${courseId}/section/${next._id}/sub-section/${next.subSection[0]._id}`
      );
    }
  };

  const goToPrevVideo = () => {
    const idx = courseSectionData.findIndex((s) => s._id === sectionId);
    const subIdx = courseSectionData[idx].subSection.findIndex(
      (d) => d._id === subSectionId
    );
    if (subIdx !== 0) {
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${courseSectionData[idx].subSection[subIdx - 1]._id}`
      );
    } else {
      const prev = courseSectionData[idx - 1];
      const prevSubs = prev.subSection;
      navigate(
        `/view-course/${courseId}/section/${prev._id}/sub-section/${prevSubs[prevSubs.length - 1]._id}`
      );
    }
  };

  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId, subSectionId, userId: user._id },
      token
    );
    if (res) dispatch(updateCompletedLectures(subSectionId));
    setLoading(false);
  };

  const { lectureNum, totalLectures, currentSection } = getLectureInfo();
  const isCompleted = completedLectures.includes(subSectionId);

  return (
    <div className="flex flex-col gap-0 text-white w-full lg:pr-6">
      {/* ── Video Player ─────────────────────────────────────────── */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-richblack-700">
        {!videoData ? (
          <div className="relative aspect-video">
            <img
              src={previewSource}
              alt="Course preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <MdOutlinePlayCircle className="text-white/60 text-7xl" />
            </div>
          </div>
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
            </Player>

            {/* Video ended overlay */}
            {videoEnded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/80 backdrop-blur-sm">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
                    <MdCheckCircle size={26} /> Lecture completed
                  </div>
                ) : (
                  <button
                    disabled={loading}
                    onClick={handleLectureCompletion}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold px-7 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-green-900/40"
                  >
                    <MdCheckCircle size={20} />
                    {loading ? "Saving…" : "Mark as Complete"}
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playerRef.current?.seek(0);
                      playerRef.current?.play();
                      setVideoEnded(false);
                    }}
                    className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    <MdReplay size={16} /> Rewatch
                  </button>
                  {!isLastVideo() && (
                    <button
                      onClick={goToNextVideo}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all"
                    >
                      Next <MdSkipNext size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Info bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-4 pb-2">
        {/* Section breadcrumb + lecture position */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-richblack-400 min-w-0">
            <span className="truncate">{currentSection?.sectionName}</span>
            {videoData?.timeDuration && (
              <>
                <span className="flex-shrink-0">·</span>
                <BiTime size={13} className="flex-shrink-0" />
                <span className="flex-shrink-0">{formatDuration(videoData.timeDuration)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full font-medium">
                <MdCheckCircle size={12} /> Completed
              </span>
            )}
            <span className="text-xs text-richblack-400 bg-richblack-700 px-2.5 py-1 rounded-full">
              {lectureNum} / {totalLectures}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
          {videoData?.title}
        </h1>

        {/* Navigation + mark complete bar */}
        <div className="flex items-center justify-between gap-3 py-3 border-t border-b border-richblack-700 mt-1">
          <button
            disabled={isFirstVideo() || loading}
            onClick={goToPrevVideo}
            className="flex items-center gap-1.5 text-sm text-richblack-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-richblack-700"
          >
            <MdSkipPrevious size={20} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {!isCompleted ? (
            <button
              disabled={loading}
              onClick={handleLectureCompletion}
              className="flex items-center gap-2 text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 disabled:opacity-50 text-green-400 font-medium px-5 py-2 rounded-lg transition-colors"
            >
              <MdCheckCircle size={16} />
              {loading ? "Saving…" : "Mark Complete"}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
              <MdCheckCircle size={18} /> Done
            </span>
          )}

          <button
            disabled={isLastVideo() || loading}
            onClick={goToNextVideo}
            className="flex items-center gap-1.5 text-sm text-richblack-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-richblack-700"
          >
            <span className="hidden sm:inline">Next</span>
            <MdSkipNext size={20} />
          </button>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────── */}
      {videoData?.description && (
        <div className="mt-3 pb-10">
          <h3 className="text-xs font-semibold text-richblack-400 uppercase tracking-widest mb-2">
            About this lecture
          </h3>
          <div
            className={`text-sm text-richblack-200 leading-relaxed ${
              !descExpanded ? "line-clamp-3" : ""
            }`}
          >
            {videoData.description}
          </div>
          {videoData.description.length > 200 && (
            <button
              onClick={() => setDescExpanded((p) => !p)}
              className="mt-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {descExpanded ? "Show less ↑" : "Show more ↓"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoDetails;
