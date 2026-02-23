import FoundingStoryImage from '../../../assets/Images/FoundingStory.png'

const FoundingStory = () => {
  return (
    <section className="bg-richblack-900 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Founding Story + image ── */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16 lg:mb-24">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-3xl lg:text-4xl font-semibold text-transparent">
              Our Founding Story
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Our e-learning platform was born out of a shared vision and passion
              for transforming education. It all began with a group of educators,
              technologists, and lifelong learners who recognized the need for
              accessible, flexible, and high-quality learning opportunities in a
              rapidly evolving digital world.
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              As experienced educators ourselves, we witnessed firsthand the
              limitations and challenges of traditional education systems. We
              believed that education should not be confined to the walls of a
              classroom or restricted by geographical boundaries. We envisioned a
              platform that could bridge these gaps and empower individuals from
              all walks of life to unlock their full potential.
            </p>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <img
              src={FoundingStoryImage}
              alt="Founding Story"
              className="w-full max-w-sm sm:max-w-md lg:max-w-full rounded-xl
                         shadow-[0_0_40px_-5px_rgba(252,103,103,0.4)]"
            />
          </div>
        </div>

        {/* ── Vision + Mission ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 border-t border-gray-700 pt-14 lg:pt-20">
          <div className="flex flex-col gap-6">
            <h2 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-3xl lg:text-4xl font-semibold text-transparent">
              Our Vision
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              With this vision in mind, we set out on a journey to create an
              e-learning platform that would revolutionize the way people learn.
              Our team of dedicated experts worked tirelessly to develop a robust
              and intuitive platform that combines cutting-edge technology with
              engaging content, fostering a dynamic and interactive learning
              experience.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-3xl lg:text-4xl font-semibold">
              Our Mission
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Our mission goes beyond just delivering courses online. We wanted
              to create a vibrant community of learners where individuals can
              connect, collaborate, and learn from one another. We believe that
              knowledge thrives in an environment of sharing and dialogue, and we
              foster this spirit of collaboration through forums, live sessions,
              and networking opportunities.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default FoundingStory
