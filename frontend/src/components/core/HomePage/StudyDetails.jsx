import { BiDiamond } from "react-icons/bi";
import { SlBadge } from "react-icons/sl";
import { FaGraduationCap } from "react-icons/fa";
import { HiMiniCodeBracket } from "react-icons/hi2";

const iconsMap = { SlBadge, FaGraduationCap, BiDiamond, HiMiniCodeBracket };

const bgMap = {
  blue: "bg-blue-400/10",
  orange: "bg-orange-400/10",
  emerald: "bg-emerald-400/10",
  yellow: "bg-yellow-400/10",
};

const colorMap = {
  blue: "text-blue-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
  yellow: "text-yellow-400",
};

const StudyDetails = ({ icon, name, description, color }) => {
  const IconComponent = iconsMap[icon];
  return (
    <div className="flex items-center gap-4 p-4 bg-[#1d1d1d] rounded-xl border border-gray-800">
      <div
        className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl text-xl ${bgMap[color]} ${colorMap[color]}`}
      >
        <IconComponent />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default StudyDetails;
