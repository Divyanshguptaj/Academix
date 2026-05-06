import HighlightText from '../HomePage/HiglightedText'
import ImgWithPlaceholder from '../../common/ImgWithPlaceholder'

const HeroSection = () => {
  return (
    <section className="bg-richblack-800 border-b border-gray-700 overflow-hidden">
      {/* top yellow accent strip */}
      <div className="h-0.5 bg-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-20">

        {/* Heading + subtext */}
        <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Driving Innovation in Online Education for a{" "}
            <HighlightText text={"Brighter Future"} />
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Academix is at the forefront of driving innovation in online
            education. We&apos;re passionate about creating a brighter future by
            offering cutting-edge courses, leveraging emerging technologies,
            and nurturing a vibrant learning community.
          </p>
        </div>

        {/* Staggered image row — tallest in centre, shorter on sides */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 lg:gap-5 max-w-4xl mx-auto">
          <div className="flex-1 rounded-t-xl overflow-hidden">
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090720/aboutus1_wdueuh.webp"
              alt="About Academix"
              containerClassName="w-full h-36 sm:h-52 lg:h-64"
            />
          </div>
          <div className="flex-1 rounded-t-xl overflow-hidden">
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090720/aboutus2_cjixqe.webp"
              alt="About Academix"
              containerClassName="w-full h-48 sm:h-64 lg:h-80"
            />
          </div>
          <div className="flex-1 rounded-t-xl overflow-hidden">
            <ImgWithPlaceholder
              src="https://res.cloudinary.com/dfocfto1r/image/upload/v1778090721/aboutus3_vrx4dh.webp"
              alt="About Academix"
              containerClassName="w-full h-36 sm:h-52 lg:h-64"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
