import ChangeProfilePicture from "./ChangeProfilePicture"
import DeleteAccount from "./DeleteAccount"
import EditProfile from "./EditProfile"
import UpdatePassword from "./UpdatePassword"
import { FiSettings } from "react-icons/fi"

export default function Settings() {
  return (
    <div className="pb-10">
      {/* Page Header */}
      <div className="mb-8 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiSettings className="text-yellow-400 text-lg" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-richblack-5">Account Settings</h1>
            <p className="text-sm text-richblack-400 mt-0.5">Manage your profile, password and account preferences</p>
          </div>
        </div>
      </div>

      <ChangeProfilePicture />
      <EditProfile />
      <UpdatePassword />
      <DeleteAccount />
    </div>
  )
}