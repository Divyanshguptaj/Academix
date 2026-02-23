import { useState } from "react";
import HiglightedText from "./HiglightedText";
import { HomePageExplore } from "../../../data/homepage-explore";
import { FaUsers, FaChartLine } from "react-icons/fa";

const tabsName = [
  "Free",
  "New to Coding",
  "Most Popular",
  "Skill Paths",
  "Career Paths",
];

const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourse] = useState(HomePageExplore[0].courses);

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourse(result.length > 0 ? result[0].courses : []);
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 sm:px-8 lg:px-20 py-12 lg:py-20 w-full">

      {/* Heading */}
      <div className="text-3xl sm:text-4xl font-semibold flex flex-wrap justify-center text-white text-center">
        <p>Unlock the&nbsp;</p>
        <HiglightedText text="Power of Coding" />
      </div>

      {/* Subheading */}
      <p className="text-gray-400 text-sm mt-3 text-center">
        Learn to build anything you can imagine
      </p>

      {/* Tabs */}
      <div className="flex overflow-x-auto mt-8 p-1 gap-1 bg-gray-800/60 rounded-full border border-gray-700/60">
        {tabsName.map((element, index) => (
          <button
            key={index}
            onClick={() => setMyCards(element)}
            className={`text-sm whitespace-nowrap rounded-full px-4 py-1.5 transition-all duration-200 cursor-pointer ${
              currentTab === element
                ? "bg-[#1d1d1d] text-white shadow-sm border border-gray-700"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {element}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-10 lg:mt-14 w-full max-w-5xl flex flex-col md:flex-row gap-6 justify-center items-stretch">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className={`w-full md:w-1/3 flex flex-col justify-between rounded-xl p-5 border transition-all duration-200 ${
              idx === 0
                ? "bg-white text-zinc-900 border-transparent"
                : "bg-[#1d1d1d] text-white border-gray-800"
            }`}
            style={idx === 0 ? { boxShadow: "8px 8px 0px #FFD60A" } : {}}
          >
            <div>
              <p className="text-lg font-semibold">{course.heading}</p>
              <p
                className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                  idx === 0 ? "text-zinc-500" : "text-gray-400"
                }`}
              >
                {course.desciption}
              </p>
            </div>
            <div
              className={`flex w-full justify-center mt-5 border-t-2 border-dashed ${
                idx === 0 ? "border-zinc-300" : "border-gray-700"
              }`}
            >
              <div className="text-blue-400 w-1/2 flex justify-center items-center gap-2 text-xs sm:text-sm py-3">
                <FaUsers /> {course.level}
              </div>
              <div className="text-blue-400 w-1/2 flex justify-center items-center gap-2 text-xs sm:text-sm py-3">
                <FaChartLine /> {course.lessonNumber}&nbsp;Lessons
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreMore;
