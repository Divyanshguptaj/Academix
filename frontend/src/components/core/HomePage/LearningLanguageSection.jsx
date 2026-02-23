import HiglightedText from "./HiglightedText";
import Imagells1 from "../../../assets/Images/homeStudy1.png";
import Imagells2 from "../../../assets/Images/homeStudy2.png";
import Imagells3 from "../../../assets/Images/homeStudy3.png";
import CTAButton from "./Button";

const LearningLanguageSection = () => {
  return (
    <div className="bg-[#1d1d1d] w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-b border-gray-800">
      <div className="max-w-5xl mx-auto flex flex-col items-center">

        {/* Heading */}
        <div className="font-bold text-3xl sm:text-4xl text-white text-center leading-snug">
          Your swiss knife for{" "}
          <HiglightedText text="learning a language" />
        </div>

        {/* Subheading */}
        <p className="text-gray-400 text-sm sm:text-base text-center mt-5 max-w-xl leading-relaxed">
          With Academix, mastering multiple skills is easy. Enjoy 20+ learning
          paths with progress tracking, custom schedules, and expert-curated
          content.
        </p>

        {/* Images */}
        <div className="flex flex-col sm:flex-row w-full items-center justify-center mt-12 gap-8 sm:gap-6">
          <img
            src={Imagells1}
            alt="Learning"
            className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs"
            style={{ transform: "rotate(6deg)" }}
          />
          <img
            src={Imagells2}
            alt="Learning"
            className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs"
            style={{ transform: "rotate(-4deg)" }}
          />
          <img
            src={Imagells3}
            alt="Learning"
            className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs"
            style={{ transform: "rotate(6deg)" }}
          />
        </div>

        <div className="mt-12">
          <CTAButton text="Learn More" color="yellow" link="/login" />
        </div>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
