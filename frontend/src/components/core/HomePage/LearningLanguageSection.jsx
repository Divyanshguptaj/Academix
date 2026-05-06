import HiglightedText from "./HiglightedText";
import CTAButton from "./Button";
import ImgWithPlaceholder from "../../common/ImgWithPlaceholder";

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
          <div className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs" style={{ transform: "rotate(6deg)" }}>
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090721/homeStudy1_hmjsbm.png"
              alt="Learning"
              containerClassName="w-full aspect-square !bg-transparent"
              className="!object-contain"
            />
          </div>
          <div className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs" style={{ transform: "rotate(-4deg)" }}>
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090721/homeStudy2_k0fyeq.png"
              alt="Learning"
              containerClassName="w-full aspect-square !bg-transparent"
              className="!object-contain"
            />
          </div>
          <div className="shadow-2xl w-[70%] sm:w-[28%] max-w-xs" style={{ transform: "rotate(6deg)" }}>
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090722/homeStudy3_kmvdbs.png"
              alt="Learning"
              containerClassName="w-full aspect-square !bg-transparent"
              className="!object-contain"
            />
          </div>
        </div>

        <div className="mt-12">
          <CTAButton text="Learn More" color="yellow" link="/login" />
        </div>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
