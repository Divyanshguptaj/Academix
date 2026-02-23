import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import CTAButton from "../components/core/HomePage/Button";
import HiglightedText from "../components/core/HomePage/HiglightedText";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import Banner from "../assets/Images/banner.mp4";
import TimelineSection from "../components/core/HomePage/TimelineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import BecomeInstructor from "../components/core/HomePage/BecomeInstructor";
import ExploreMore from "../components/core/HomePage/ExploreMore";
import ReviewSlider from "../components/common/ReviewSlider";

const Home = () => {
  return (
    <div className="flex flex-col items-center text-white overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="w-full bg-[#121220] pt-24 pb-12 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">

          {/* Pill badge */}
          <Link to="/signup">
            <div className="group inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-5 py-2 text-sm text-gray-300 hover:border-yellow-400/50 hover:text-white transition-all duration-200">
              Become an instructor
              <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Empower your future with
            <br />
            <HiglightedText text="Coding Skills" />
          </h1>

          {/* Sub-copy */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Learn at your own pace, from anywhere in the world. Get access to
            hands-on projects, quizzes, and personalised feedback from expert
            instructors.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <CTAButton text="Learn More" color="yellow" link="/login" />
            <CTAButton text="Book a Demo" color="black" link="/signup" />
          </div>
        </div>

        {/* Hero video */}
        <div className="mt-14 mx-auto max-w-3xl px-4 sm:px-6">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow:
                "0 0 80px -15px rgba(59,130,246,0.4), 0 30px 60px -20px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <video muted loop autoPlay className="w-full block">
              <source src={Banner} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ── Code blocks ── */}
      <section className="w-full bg-[#121220]">
        <CodeBlocks
          position="lg:flex-row"
          heading={
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Unlock Your <HiglightedText text="Coding Potential" /> with our
              online courses
            </div>
          }
          subheading="With our online courses, you can learn at your own pace, from coast to cloud — and unlock a world full of resources, including hands-on projects and personalised feedback."
          ctabtn1={{
            text: (<><p>Learn More</p><FaArrowRight /></>),
            color: "yellow",
            link: "/login",
          }}
          ctabtn2={{ text: "Try it Yourself", color: "black", link: "/signup" }}
          codeblock={`<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <nav>
      <a href="one/">One</a>
      <a href="two/">Two</a>
    </nav>
  </body>
</html>`}
          backgroundGradient="yellow"
          codeColor="text-yellow-400"
        />

        <CodeBlocks
          position="lg:flex-row-reverse"
          heading={
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Start <HiglightedText text="Coding in seconds" />
            </div>
          }
          subheading="Code now — no waiting, no hassle. Learn at your own pace, from anywhere in the world, and get ready to thrive in tomorrow's world with clear roadmaps and guided support."
          ctabtn1={{
            text: (<><p>Learn More</p><FaArrowRight /></>),
            color: "yellow",
            link: "/login",
          }}
          ctabtn2={{ text: "Try it Yourself", color: "black", link: "/signup" }}
          codeblock={`<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <nav>
      <a href="one/">One</a>
      <a href="two/">Two</a>
    </nav>
  </body>
</html>`}
          backgroundGradient="blue"
          codeColor="text-blue-400"
        />
      </section>

      {/* ── Explore more ── */}
      <section className="w-full bg-[#121220] border-t border-gray-800">
        <ExploreMore />
      </section>

      {/* ── CTA banner ── */}
      <div className="homepage_bg h-[200px] sm:h-[300px] w-full flex flex-col justify-center items-center gap-5">
        <p className="text-black text-xl sm:text-2xl font-bold text-center px-4 drop-shadow-lg">
          Explore our full course catalog
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <CTAButton
            text={<><p>View Full Catalog</p><FaArrowRight /></>}
            color="yellow"
            link="/catalog"
          />
          <CTAButton text="Learn More" color="black" link="" />
        </div>
      </div>

      {/* ── Get the skills ── */}
      <section className="bg-[#1d1d1d] w-full py-16 lg:py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="font-bold text-3xl sm:text-4xl text-white lg:w-1/2 text-center lg:text-left leading-tight">
            Get the skills that{" "}
            <HiglightedText text="employers are looking for." />
          </div>
          <div className="flex flex-col gap-5 lg:w-1/2 text-center lg:text-left">
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              The modern job market demands more than just professional skills.
              Build a complete toolkit that sets you apart — with real projects,
              peer collaboration, and expert guidance from industry professionals.
            </p>
            <div className="flex justify-center lg:justify-start">
              <CTAButton text="Learn More" color="yellow" link="/signup" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <TimelineSection />

      {/* ── Learning languages ── */}
      <LearningLanguageSection />

      {/* ── Become instructor ── */}
      <BecomeInstructor />

      {/* ── Reviews ── */}
      <ReviewSlider />

    </div>
  );
};

export default Home;
