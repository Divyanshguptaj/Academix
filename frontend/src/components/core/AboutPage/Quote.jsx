import HighlightText from '../HomePage/HiglightedText'

const Quote = () => {
  return (
    <blockquote className="text-xl sm:text-2xl lg:text-4xl font-semibold text-center text-white leading-snug">
      We are passionate about revolutionizing the way we learn. Our innovative
      platform <HighlightText text={"combines technology"} />,{" "}
      <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text">
        expertise
      </span>
      , and community to create an{" "}
      <span className="bg-gradient-to-b from-[#E65C00] to-[#F9D423] text-transparent bg-clip-text">
        unparalleled educational experience.
      </span>
    </blockquote>
  )
}

export default Quote