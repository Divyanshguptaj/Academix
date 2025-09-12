import FoundingStoryImage from '../../../assets/Images/FoundingStory.png'

const FoundingStory = () => {
  return (
    <section className="my-10 md:my-0">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-300 font-normal">
          <div className="flex flex-col items-center gap-10 lg:flex-row justify-between lg:px-12 xl:px-24">
            <div className="my-12 lg:my-24 flex lg:w-[50%] flex-col gap-6 md:gap-10">
              <h1 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-3xl md:text-4xl font-semibold text-transparent lg:w-[90%]">
                Our Founding Story
              </h1>
              <p className="text-sm md:text-base font-normal text-richblack-300 lg:w-[95%]">
                Our e-learning platform was born out of a shared vision and
                passion for transforming education. It all began with a group of
                educators, technologists, and lifelong learners who recognized
                the need for accessible, flexible, and high-quality learning
                opportunities in a rapidly evolving digital world.
              </p>
              <p className="text-sm md:text-base font-normal text-richblack-300 lg:w-[95%]">
                As experienced educators ourselves, we witnessed firsthand the
                limitations and challenges of traditional education systems. We
                believed that education should not be confined to the walls of a
                classroom or restricted by geographical boundaries. We
                envisioned a platform that could bridge these gaps and empower
                individuals from all walks of life to unlock their full
                potential.
              </p>
            </div>

            <div className="w-full lg:w-[45%] flex justify-center">
              <img
                src={FoundingStoryImage}
                alt="Founding Story"
                className="shadow-[0_0_20px_0] shadow-[#FC6767] w-full max-w-md lg:max-w-full"
              />
            </div>
          </div>

          <div className="flex flex-col items-center lg:gap-10 lg:flex-row justify-between lg:px-12 xl:px-24 mt-10 md:mt-0">
            <div className="my-12 lg:my-24 flex lg:w-[45%] flex-col gap-6 md:gap-10">
              <h1 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-3xl md:text-4xl font-semibold text-transparent">
                Our Vision
              </h1>
              <p className="text-sm md:text-base font-normal text-richblack-300">
                With this vision in mind, we set out on a journey to create an
                e-learning platform that would revolutionize the way people
                learn. Our team of dedicated experts worked tirelessly to
                develop a robust and intuitive platform that combines
                cutting-edge technology with engaging content, fostering a
                dynamic and interactive learning experience.
              </p>
            </div>
            <div className="my-12 lg:my-24 flex lg:w-[45%] flex-col gap-6 md:gap-10">
              <h1 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-3xl md:text-4xl font-semibold">
                Our Mission
              </h1>
              <p className="text-sm md:text-base font-normal text-richblack-300">
                Our mission goes beyond just delivering courses online. We wanted to create a vibrant community of learners, where individuals can connect, collaborate, and learn from one another. We believe that knowledge thrives in an environment of sharing and dialogue, and we foster this spirit of collaboration through forums, live sessions, and networking opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}

export default FoundingStory
