import { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FiLock, FiSave, FiX } from "react-icons/fi"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { changePassword } from "../../../../services/operations/settingsAPI"
import { toast } from "react-hot-toast"

const inputClass =
  "w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 text-sm placeholder:text-richblack-400 focus:outline-none focus:border-yellow-400/60 transition-colors pr-10"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const submitPasswordForm = async (data) => {
    try {
      const mail = user.email
      const formData = { ...data, mail }

      if (formData.newPassword.length < 8) {
        toast.error("Minimum length of password should be 8")
        return
      }
      if (!/\d/.test(formData.newPassword)) {
        toast.error("Password must include at least one number")
        return
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
        toast.error("Password must include at least one special character")
        return
      }

      const res = await changePassword(token, formData)
      if (res) {
        toast.success("Password updated successfully")
        reset()
        setShowOldPassword(false)
        setShowNewPassword(false)
      }
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      toast.error("Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)}>
      <div className="my-6 md:my-10 rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden mx-4 md:mx-0">

        {/* Section Header */}
        <div className="flex items-center gap-3 px-6 md:px-10 py-5 border-b border-richblack-700">
          <div className="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiLock className="text-yellow-400 text-base" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-richblack-5">Change Password</h2>
            <p className="text-xs text-richblack-400 mt-0.5">Keep your account secure with a strong password</p>
          </div>
        </div>

        <div className="px-6 md:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="oldPassword" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                <FiLock className="text-richblack-400 text-xs" /> Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="oldPassword"
                  placeholder="Enter current password"
                  className={inputClass}
                  {...register("oldPassword", { required: true })}
                />
                <span
                  onClick={() => setShowOldPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-richblack-400 hover:text-richblack-200 transition-colors"
                >
                  {showOldPassword
                    ? <AiOutlineEyeInvisible fontSize={18} />
                    : <AiOutlineEye fontSize={18} />}
                </span>
              </div>
              {errors.oldPassword && (
                <span className="text-[11px] text-yellow-300">Please enter your current password.</span>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                <FiLock className="text-richblack-400 text-xs" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="Enter new password"
                  className={inputClass}
                  {...register("newPassword", { required: true })}
                />
                <span
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-richblack-400 hover:text-richblack-200 transition-colors"
                >
                  {showNewPassword
                    ? <AiOutlineEyeInvisible fontSize={18} />
                    : <AiOutlineEye fontSize={18} />}
                </span>
              </div>
              {errors.newPassword && (
                <span className="text-[11px] text-yellow-300">Please enter your new password.</span>
              )}
            </div>

          </div>

          {/* Password requirements hint */}
          <p className="mt-4 text-xs text-richblack-500">
            Password must be at least 8 characters, include a number and a special character.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 md:px-0 mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 py-2.5 px-5 font-medium text-richblack-300 text-sm transition-colors order-2 sm:order-1"
        >
          <FiX className="text-sm" /> Cancel
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-yellow-400 hover:bg-yellow-300 py-2.5 px-5 font-semibold text-richblack-900 text-sm transition-colors order-1 sm:order-2"
        >
          <FiSave className="text-sm" /> Update Password
        </button>
      </div>
    </form>
  )
}
