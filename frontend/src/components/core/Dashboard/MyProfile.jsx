import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiEdit2, FiInfo, FiBookOpen, FiCheckCircle, FiAward
} from "react-icons/fi"
import { BsGenderAmbiguous, BsPersonBadge } from "react-icons/bs"
import { fetchUserDetails } from "../../../services/operations/profileAPI"
import { getUserImage, createImageErrorHandler } from "../../../utils/imageUtils"
import { formattedDate } from "../../../utils/dateFormatter"
import { motion } from "framer-motion"

const DetailItem = ({ icon: Icon, label, value, placeholder }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-richblack-400 flex items-center gap-1.5">
      <Icon className="text-[11px]" /> {label}
    </span>
    <span className={`text-sm font-medium ${value ? "text-richblack-5" : "text-richblack-500 italic"}`}>
      {value || placeholder}
    </span>
  </div>
)

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const calculateCompletion = () => {
    let count = 0;
    if (user?.firstName) count++;
    if (user?.lastName) count++;
    if (user?.email) count++;
    if (user?.additionalDetails?.about) count++;
    if (user?.additionalDetails?.contactNumber) count++;
    if (user?.additionalDetails?.gender) count++;
    if (user?.additionalDetails?.dateOfBirth) count++;
    return Math.round((count / 7) * 100);
  }
  const completionPercentage = calculateCompletion();

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchUserDetails(user.email))
    }
  }, [dispatch, user?.email])

  const editBtn = (
    <button
      onClick={() => navigate("/dashboard/settings")}
      className="flex items-center gap-1.5 text-xs font-medium text-richblack-300 hover:text-yellow-400 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 rounded-lg px-3 py-1.5 transition-colors"
    >
      <FiEdit2 className="text-xs" /> Edit
    </button>
  )

  return (
    <motion.div 
      variants={fadeIn} 
      initial="hidden" 
      animate="visible" 
      className="w-full px-4 py-8 lg:py-0 lg:px-0"
    >

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8 sm:mb-10">
        <div className="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiUser className="text-yellow-400 text-base" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-richblack-5">My Profile</h1>
          <p className="text-xs text-richblack-400 mt-0.5">View and manage your personal information</p>
        </div>
      </div>

      {/* Profile Completion Bar */}
      {completionPercentage < 100 && (
        <div className="mb-6 bg-richblack-800 border border-richblack-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm font-semibold text-richblack-5">Profile Completion</p>
              <p className="text-xs font-bold text-yellow-400">{completionPercentage}%</p>
            </div>
            <div className="w-full bg-richblack-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => navigate("/dashboard/settings")}
            className="text-xs font-semibold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2.5 rounded-lg flex-shrink-0 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden mb-6">
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400/60 via-yellow-400/20 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 md:px-10 py-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={getUserImage(user)}
                alt={`profile-${user?.firstName}`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-richblack-600 ring-offset-2 ring-offset-richblack-800"
                onError={createImageErrorHandler(user)}
                loading="lazy"
              />
              {/* Online indicator */}
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-richblack-800" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-lg font-semibold text-richblack-5 truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-richblack-400 truncate">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                user?.accountType === "Instructor"
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
              }`}>
                <BsPersonBadge className="text-xs" />
                {user?.accountType || "Student"}
              </span>
            </div>
          </div>
          {editBtn}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:bg-richblack-700 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <FiBookOpen className="text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-richblack-5">{user?.courses?.length || 0}</h3>
            <p className="text-[10px] font-medium text-richblack-400 uppercase tracking-wider mt-0.5">Enrolled Courses</p>
          </div>
        </div>
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:bg-richblack-700 transition-colors">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <FiCheckCircle className="text-green-400 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-richblack-5">0</h3>
            <p className="text-[10px] font-medium text-richblack-400 uppercase tracking-wider mt-0.5">Completed</p>
          </div>
        </div>
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:bg-richblack-700 transition-colors">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
            <FiAward className="text-yellow-400 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-richblack-5">0</h3>
            <p className="text-[10px] font-medium text-richblack-400 uppercase tracking-wider mt-0.5">Certificates</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden mb-6">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-richblack-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiFileText className="text-yellow-400 text-xs" />
            </div>
            <span className="text-sm font-semibold text-richblack-5">About</span>
          </div>
          {editBtn}
        </div>

        <div className="px-6 md:px-10 py-5">
          <p className={`text-sm leading-relaxed ${
            user?.additionalDetails?.about
              ? "text-richblack-100"
              : "text-richblack-500 italic"
          }`}>
            {user?.additionalDetails?.about ?? "No bio added yet. Tell others a bit about yourself."}
          </p>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-richblack-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiInfo className="text-yellow-400 text-xs" />
            </div>
            <span className="text-sm font-semibold text-richblack-5">Personal Details</span>
          </div>
          {editBtn}
        </div>

        <div className="px-6 md:px-10 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
            <DetailItem
              icon={FiUser}
              label="First Name"
              value={user?.firstName}
              placeholder="Not provided"
            />
            <DetailItem
              icon={FiUser}
              label="Last Name"
              value={user?.lastName}
              placeholder="Not provided"
            />
            <DetailItem
              icon={FiMail}
              label="Email"
              value={user?.email}
              placeholder="Not provided"
            />
            <DetailItem
              icon={FiPhone}
              label="Phone Number"
              value={user?.additionalDetails?.contactNumber}
              placeholder="Add contact number"
            />
            <DetailItem
              icon={BsGenderAmbiguous}
              label="Gender"
              value={user?.additionalDetails?.gender}
              placeholder="Add gender"
            />
            <DetailItem
              icon={FiCalendar}
              label="Date of Birth"
              value={
                user?.additionalDetails?.dateOfBirth
                  ? formattedDate(user.additionalDetails.dateOfBirth)
                  : null
              }
              placeholder="Add date of birth"
            />
          </div>
        </div>
      </div>

    </motion.div>
  )
}
