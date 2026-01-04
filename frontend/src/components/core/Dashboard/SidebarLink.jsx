import * as Icons from "react-icons/vsc";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { NavLink, matchPath, useLocation } from "react-router-dom";

import { resetCourseState } from "../../../slices/courseSlice";

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName] || AiOutlineShoppingCart;
  const location = useLocation();
  const dispatch = useDispatch();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative px-4 lg:px-8 py-2 text-sm font-medium flex items-center justify-center lg:justify-start group ${
        matchRoute(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      } transition-all duration-200`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <Icon className="text-lg" />
      {/* Text hidden on small screens */}
      <span className="hidden lg:block ml-2">{link.name}</span>

      {/* Tooltip on hover for small screens */}
      {/* <span className="absolute left-full ml-2 hidden group-hover:block bg-richblack-700 text-white text-xs px-2 py-1 rounded-md lg:hidden">
        {link.name}
      </span> */}
    </NavLink>
  );
}
