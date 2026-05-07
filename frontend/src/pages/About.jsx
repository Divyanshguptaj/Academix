import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import StatsComponent from "../components/core/AboutPage/Stats"
import ReviewSlider from "../components/common/ReviewSlider"
import HeroSection from "../components/core/AboutPage/HeroSection"
import QuoteSection from "../components/core/AboutPage/QuoteSection"
import FoundingStory from "../components/core/AboutPage/FoundingStory"
import { motion } from "framer-motion"

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const About = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <HeroSection/>
      </motion.div>

      {/* Quote Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn}>
        <QuoteSection/>
      </motion.div>

      {/* Founding Story Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn}>
        <FoundingStory/>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn}>
        <StatsComponent />
      </motion.div>
      
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn} className="bg-richblack-900 py-16 lg:py-24 text-white">
        <LearningGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <ContactFormSection />
        </div>
      </motion.section>

      {/* Review Slider */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeIn}>
        <ReviewSlider />
      </motion.div>
    </div>
  )
}

export default About