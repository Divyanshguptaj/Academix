import React from "react";
import CTAButton from "../HomePage/Button";
import { TypeAnimation } from "react-type-animation";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div
      className={`flex flex-col lg:flex-row ${position} my-10 lg:my-20 justify-center gap-8 lg:gap-10 w-full bg-transparent px-4 sm:px-6 `}
    >
      {/* Heading and Buttons Section */}
      <div className="flex flex-col w-full lg:w-1/2 lg:mx-20 justify-center text-center lg:text-left">
        <div className="mb-4 text-lg sm:text-xl md:text-2xl font-bold">
          {heading}
        </div>
        <div className="text-richblack-300 text-sm sm:text-base mb-6">
          {subheading}
        </div>
        <div className="flex flex-col sm:flex-row lg:gap-4 sm:gap-1 justify-center lg:justify-start">
          <CTAButton
            text={ctabtn1.text}
            color={ctabtn1.color}
            link={ctabtn1.link}
          />
          <CTAButton
            text={ctabtn2.text}
            color={ctabtn2.color}
            link={ctabtn2.link}
          />
        </div>
      </div>

      {/* Code Block Section */}
      <div className="flex w-full lg:w-1/2 mx-auto lg:mx-20 relative bg-transparent">
        {/* Line Numbers */}
        <div className="hidden sm:flex flex-col text-center w-[10%] text-xs sm:text-sm md:text-base text-richblack-300 font-bold bg-transparent">
          {Array.from({ length: 13 }, (_, i) => (
            <p key={i}>{i + 1}</p>
          ))}
        </div>

        {/* Code Block */}
        <div
          className={`w-full sm:w-[90%] flex flex-col gap-2 font-mono ${codeColor} px-3 sm:px-4 py-2 sm:py-4 bg-transparent rounded-lg`}
          style={{
            boxShadow:
              "0px 4px 10px rgba(0, 0, 0, 0.7), 0px -4px 10px rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <TypeAnimation
            sequence={[codeblock, 2000, ""]}
            repeat={Infinity}
            cursor={true}
            omitDeletionAnimation={true}
            style={{
              whiteSpace: "pre-wrap",
              display: "block",
              width: "100%",
              fontSize: "0.75rem", // text-xs default
            }}
            className="text-xs sm:text-sm md:text-base"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
