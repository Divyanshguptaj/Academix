import { TypeAnimation } from "react-type-animation";
import CTAButton from "../HomePage/Button";

const glowStyles = {
  yellow: {
    boxShadow:
      "0 0 80px -10px rgba(250,204,21,0.35), 0 30px 60px -20px rgba(0,0,0,0.9)",
    borderColor: "rgba(250,204,21,0.18)",
  },
  blue: {
    boxShadow:
      "0 0 80px -10px rgba(59,130,246,0.35), 0 30px 60px -20px rgba(0,0,0,0.9)",
    borderColor: "rgba(59,130,246,0.18)",
  },
};

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  const glow = glowStyles[backgroundGradient] || glowStyles.yellow;
  const lineCount = (codeblock || "").split("\n").length;

  return (
    <div
      className={`flex flex-col lg:flex-row ${position} items-center gap-10 lg:gap-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16`}
    >
      {/* ── Text section ── */}
      <div className="w-full lg:w-[45%] flex flex-col gap-5 text-center lg:text-left">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug">
          {heading}
        </div>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          {subheading}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-1">
          <CTAButton text={ctabtn1.text} color={ctabtn1.color} link={ctabtn1.link} />
          <CTAButton text={ctabtn2.text} color={ctabtn2.color} link={ctabtn2.link} />
        </div>
      </div>

      {/* ── Code block ── */}
      <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: "#0d0d14",
            boxShadow: glow.boxShadow,
            border: `1px solid ${glow.borderColor}`,
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]"
            style={{ background: "#13131c" }}
          >
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-gray-500 font-mono select-none">
              index.html
            </span>
          </div>

          {/* Code area */}
          <div className="flex font-mono text-xs sm:text-sm py-5 overflow-x-auto">
            {/* Line numbers */}
            <div className="flex-shrink-0 flex flex-col text-right text-gray-600 select-none pl-4 pr-3 border-r border-white/[0.06]">
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className="leading-6 tabular-nums">
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Code content */}
            <div className={`pl-5 pr-4 flex-1 leading-6 ${codeColor}`}>
              <TypeAnimation
                sequence={[codeblock, 2000, ""]}
                repeat={Infinity}
                cursor={true}
                omitDeletionAnimation={true}
                style={{ whiteSpace: "pre-wrap", display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
