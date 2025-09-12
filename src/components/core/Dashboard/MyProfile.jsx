import { RiEditBoxLine } from "react-icons/ri"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"
import { useEffect } from "react"
import { fetchUserDetails } from "../../../services/operations/profileAPI"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const getUserDetails = async () => {
    try {
      dispatch(fetchUserDetails(user.email));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  
  useEffect(() => {
    if (user?.email) {
      getUserDetails();
    }
  }, []);
  
  return (
    <div className="w-full px-4 py-8 lg:py-0 lg:px-0">
      <h1 className="mb-8 text-2xl font-medium text-white sm:text-3xl sm:my-14">
        My Profile
      </h1>
      
      {/* Profile Card */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 sm:flex-row sm:items-center sm:p-8 sm:px-12">
        <div className="flex items-center gap-x-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-16 rounded-full object-cover sm:w-[78px]"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-cyan-400">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-sm text-richblack-300">{user?.email}</p>
          </div>
        </div>
        <IconBtn
          text="Edit "
          onclick={() => {
            navigate("/dashboard/settings")
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>
      
      {/* About Section */}
      <div className="my-8 flex flex-col gap-y-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 sm:my-10 sm:p-8 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-cyan-400">About</p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? "text-white"
              : "text-richblack-400"
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="my-8 flex flex-col gap-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 sm:my-10 sm:p-8 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-cyan-400">
            Personal Details
          </p>
          <IconBtn
            text="Edit"
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:max-w-[500px] sm:gap-x-10">
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-cyan-200">First Name</p>
              <p className="text-sm font-medium text-white">
                {user?.firstName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-cyan-200">Email</p>
              <p className="text-sm font-medium text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-cyan-200">Gender</p>
              <p className="text-sm font-medium text-white">
                {user?.additionalDetails?.gender ?? "Add Gender"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-cyan-200">Last Name</p>
              <p className="text-sm font-medium text-white">
                {user?.lastName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-cyan-200">Phone Number</p>
              <p className="text-sm font-medium text-white">
                {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-cyan-200">Date Of Birth</p>
              <p className="text-sm font-medium text-white">
                {user?.additionalDetails?.dateOfBirth ? formattedDate(user?.additionalDetails?.dateOfBirth) : "Add Date Of Birth"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}