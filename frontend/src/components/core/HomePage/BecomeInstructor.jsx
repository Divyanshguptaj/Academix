import HiglightedText from "./HiglightedText";
import CTAButton from "./Button";
import { FaArrowRight } from "react-icons/fa";
import ImgWithPlaceholder from "../../common/ImgWithPlaceholder";

const BecomeInstructor = () => {
  return (
    <div className="w-full bg-[#121220] flex flex-col md:flex-row gap-10 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 justify-center items-center border-b border-gray-800">

      {/* Image */}
      <div className="w-full md:w-[35%] flex justify-center items-center">
        <ImgWithPlaceholder
          src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090728/standing_lady_with_book_uptcdl.png"
          alt="Become an Instructor"
          containerClassName="w-[70%] sm:w-[55%] md:w-full max-w-xs md:max-w-sm aspect-[4/5] !bg-transparent"
          className="!object-contain"
        />
      </div>

      {/* Text */}
      <div className="w-full md:w-[50%] flex flex-col justify-center items-center md:items-start text-center md:text-left gap-5">
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
          Become an
          <br />
          <HiglightedText text="Instructor" />
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md">
          Share your knowledge and inspire students around the world. Join a
          community of passionate educators and make a real difference in
          people's lives.
        </p>
        <CTAButton
          text={
            <>
              <p>Start Teaching Today</p>
              <FaArrowRight />
            </>
          }
          color="yellow"
          link="/signup"
        />
      </div>
    </div>
  );
};

export default BecomeInstructor;
