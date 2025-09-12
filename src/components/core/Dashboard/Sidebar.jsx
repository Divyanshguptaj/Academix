import { useState } from "react";
import { VscSignOut, VscSettingsGear } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sidebarLinks } from "../../../data/dashboard-links";
import { logout } from "../../../services/operations/authAPI";
import ConfirmationModal from "../../common/ConfirmationModal";
import SidebarLink from "./SidebarLink";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[60px] lg:min-w-[220px] items-center border-r border-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[60px] lg:min-w-[220px] flex-col border-r border-richblack-700 bg-richblack-800 py-10 justify-between">
        {/* Top links */}
        <div className="flex flex-col">
          {sidebarLinks.map((link) => {
            if (user?.accountType === "Student" && (link.id === 2 || link.id === 3 || link.id === 4)) return null;
            if (user?.accountType === "Instructor" && (link.id === 5 || link.id === 6)) return null;
            return <SidebarLink key={link.id} link={link} iconName={link.icon} />;
          })}
        </div>

        {/* Bottom section (settings + logout) */}
        <div className="flex flex-col">
          <SidebarLink
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettingsGear"
          />

          {/* Logout */}
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="relative flex items-center justify-center lg:justify-start gap-x-2 px-2 lg:px-8 py-2 text-sm font-medium text-richblack-300 group hover:text-yellow-50 transition-all"
          >
            <VscSignOut className="text-lg" />
            <span className="hidden lg:block">Logout</span>

            {/* Tooltip (only shows on small screens when text is hidden) */}
            <span className="absolute left-full ml-2 hidden group-hover:block bg-richblack-700 text-white text-xs px-2 py-1 rounded-md lg:hidden">
              Logout
            </span>
          </button>
        </div>
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
