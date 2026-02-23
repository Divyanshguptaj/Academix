import StudyDetails from "./StudyDetails";
import study_image from "../../../assets/Images/study_image.jpg";

const TimelineSection = () => {
  return (
    <div className="bg-[#121220] w-full flex flex-col lg:flex-row justify-center items-center px-4 sm:px-6 lg:px-8 py-16 lg:py-24 gap-12 border-b border-gray-800">

      {/* Left — study details */}
      <div className="flex flex-col w-full lg:w-[45%] gap-4">
        <StudyDetails
          icon="SlBadge"
          name="Leadership"
          description="Fully committed to the success of every student"
          color="blue"
        />
        <StudyDetails
          icon="FaGraduationCap"
          name="Responsibility"
          description="Students will always be our top priority"
          color="orange"
        />
        <StudyDetails
          icon="BiDiamond"
          name="Flexibility"
          description="The ability to adapt is an essential modern skill"
          color="emerald"
        />
        <StudyDetails
          icon="HiMiniCodeBracket"
          name="Problem Solving"
          description="Code your way to creative solutions"
          color="yellow"
        />
      </div>

      {/* Right — image + stats */}
      <div className="w-full lg:w-[55%] flex relative pb-20 lg:pb-0">
        <img
          src={study_image}
          alt="Study"
          className="w-full h-56 sm:h-72 lg:h-96 rounded-2xl shadow-2xl object-cover"
        />

        {/* Stats overlay */}
        <div className="absolute flex flex-row text-white uppercase px-6 py-5 items-center justify-center gap-8 w-[85%] left-1/2 -translate-x-1/2 bottom-0 lg:-bottom-8 rounded-xl shadow-xl border border-yellow-400/20"
          style={{ background: "#1d1d1d" }}
        >
          <div className="flex flex-col gap-1 items-center border-r border-gray-700 pr-8">
            <p className="font-bold text-2xl sm:text-3xl text-yellow-400">10+</p>
            <p className="text-gray-400 text-xs text-center leading-tight">
              Years of<br />Experience
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center pl-8">
            <p className="font-bold text-2xl sm:text-3xl text-yellow-400">250+</p>
            <p className="text-gray-400 text-xs text-center leading-tight">
              Types of<br />Courses
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TimelineSection;
