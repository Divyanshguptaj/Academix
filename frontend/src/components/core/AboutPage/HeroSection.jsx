import BannerImage1 from '../../../assets/Images/aboutus1.webp'
import BannerImage2 from "../../../assets/Images/aboutus2.webp"
import BannerImage3 from "../../../assets/Images/aboutus3.webp"
import HighlightText from '../HomePage/HiglightedText'

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
            <img src={BannerImage1} alt="About Academix"
              className="w-full h-36 sm:h-52 lg:h-64 object-cover" />
          </div>
          <div className="flex-1 rounded-t-xl overflow-hidden">
            <img src={BannerImage2} alt="About Academix"
              className="w-full h-48 sm:h-64 lg:h-80 object-cover" />
          </div>
          <div className="flex-1 rounded-t-xl overflow-hidden">
            <img src={BannerImage3} alt="About Academix"
              className="w-full h-36 sm:h-52 lg:h-64 object-cover" />
          </div>
        </div>

      </div>
    </section>
  )
}

export default HeroSection
