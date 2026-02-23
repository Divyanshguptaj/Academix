import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import StatsComponent from "../components/core/AboutPage/Stats"
import ReviewSlider from "../components/common/ReviewSlider"
import HeroSection from "../components/core/AboutPage/HeroSection"
import QuoteSection from "../components/core/AboutPage/QuoteSection"
import FoundingStory from "../components/core/AboutPage/FoundingStory"

const About = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection/>

      {/* Quote Section */}
      <QuoteSection/>

      {/* Founding Story Section */}
      <FoundingStory/>

      <StatsComponent />
      
      <section className="bg-richblack-900 py-16 lg:py-24 text-white">
        <LearningGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <ContactFormSection />
        </div>
      </section>

      {/* Review Slider */}
      <ReviewSlider />
    </div>
  )
}

export default About