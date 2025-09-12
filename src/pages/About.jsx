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
      
      <section className="mx-auto mt-16 md:mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white">
        <LearningGrid />
        <ContactFormSection />
      </section>

      {/* Review Slider */}
      <ReviewSlider />
    </div>
  )
}

export default About