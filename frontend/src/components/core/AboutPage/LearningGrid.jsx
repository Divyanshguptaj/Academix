import React from "react";
import HighlightText from "../../../components/core/HomePage/HiglightedText";
import CTAButton from "../../core/HomePage/Button";

const LearningGridArray = [
  {
    order: -1,
    heading: "World-Class Learning for",
    highlightText: "Anyone, Anywhere",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.",
    BtnText: "Learn More",
    BtnLink: "/",
  },
  {
    order: 1,
    heading: "Curriculum Based on Industry Needs",
    description:
      "Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.",
  },
  {
    order: 2,
    heading: "Our Learning Methods",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 3,
    heading: "Certification",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 4,
    heading: `Rating "Auto-grading"`,
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
  {
    order: 5,
    heading: "Ready to Work",
    description:
      "Studynotion partners with more than 275+ leading universities and companies to bring",
  },
];

const LearningGrid = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pt-10">
      {/* Mobile Layout - Stack all cards vertically */}
      <div className="grid grid-cols-1 gap-4 xl:hidden">
        {LearningGridArray.map((card, i) => {
          return (
            <div
              key={i}
              className={`${
                card.order < 0
                  ? "bg-transparent p-6"
                  : card.order % 2 === 1
                  ? "bg-slate-800 p-6 rounded-lg"
                  : "bg-zinc-900 p-6 rounded-lg"
              }`}
            >
              {card.order < 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="text-2xl sm:text-3xl font-semibold">
                    {card.heading}
                    <HighlightText text={card.highlightText} />
                  </div>
                  <p className="text-richblack-300 font-normal text-sm sm:text-base">
                    {card.description}
                  </p>
                  <div className="w-fit mt-2">
                    <CTAButton text="Learn More" color="yellow" link={card.BtnLink} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h1 className="text-richblack-300 font-medium text-lg sm:text-xl">
                    {card.heading}
                  </h1>
                  <p className="text-richblack-300 font-light text-sm sm:text-base">
                    {card.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Layout - Original grid layout for XL screens */}
      <div className="hidden xl:grid xl:grid-cols-4 xl:gap-0 xl:w-fit xl:mx-auto">
        {LearningGridArray.map((card, i) => {
          return (
            <div
              key={i}
              className={`${i === 0 && "xl:col-span-2 xl:h-[294px]"}  ${
                card.order % 2 === 1
                  ? "bg-slate-800 h-[294px]"
                  : card.order % 2 === 0
                  ? "bg-zinc-900 h-[294px]"
                  : "bg-transparent"
              } ${card.order === 3 && "xl:col-start-2"}`}
            >
              {card.order < 0 ? (
                <div className="xl:w-[90%] flex flex-col gap-3 pb-10 xl:pb-0 p-6 xl:p-8">
                  <div className="text-4xl font-semibold">
                    {card.heading}
                    <HighlightText text={card.highlightText} />
                  </div>
                  <p className="text-richblack-300 font-normal text-sm pt-4">
                    {card.description}
                  </p>
                  <div className="w-fit mt-2">
                    <CTAButton text="Learn More" color="yellow" link={card.BtnLink} />
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col gap-8">
                  <h1 className="text-richblack-300 font-medium text-lg">
                    {card.heading}
                  </h1>
                  <p className="text-richblack-300 font-light">
                    {card.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningGrid;