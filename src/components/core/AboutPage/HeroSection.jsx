import BannerImage1 from '../../../assets/Images/aboutus1.webp'
import BannerImage2 from "../../../assets/Images/aboutus2.webp"
import BannerImage3 from "../../../assets/Images/aboutus3.webp"
import HighlightText from '../HomePage/HiglightedText'

const HeroSection = () => {
  return (
      <section className="bg-slate-800">
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white items-center">
          <header className="mx-auto py-10 md:py-20 text-2xl md:text-4xl font-semibold lg:w-[70%]">
            Driving Innovation in Online Education for a
            <HighlightText text={"Brighter Future"} />
            <p className="mx-auto mt-3 text-center text-sm md:text-base text-richblack-300 font-medium lg:w-[95%]">
              Studynotion is at the forefront of driving innovation in online
              education. We're passionate about creating a brighter future by
              offering cutting-edge courses, leveraging emerging technologies,
              and nurturing a vibrant learning community.
            </p>
          </header>
          <div className="sm:h-[50px] lg:h-[130px]"></div>
          <div className="absolute bottom-0 md:bottom-[-40px] left-[50%] grid w-full md:w-[90%] lg:w-[80%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-2 md:gap-0">
            <div className="flex justify-center items-center">
              <img 
                src={BannerImage1} 
                alt="" 
                className="h-auto w-full max-h-[120px] md:max-h-[180px] object-contain"
              />
            </div>
            <div className="flex justify-center items-center">
              <img 
                src={BannerImage2} 
                alt="" 
                className="h-auto w-full max-h-[120px] md:max-h-[180px] object-contain"
              />
            </div>
            <div className="flex justify-center items-center">
              <img 
                src={BannerImage3} 
                alt="" 
                className="h-auto w-full max-h-[120px] md:max-h-[180px] object-contain"
              />
            </div>
          </div>
        </div>
      </section>
  )
}

export default HeroSection
