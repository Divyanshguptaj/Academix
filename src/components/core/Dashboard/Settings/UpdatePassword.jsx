import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../../services/operations/settingsAPI";
import IconBtn from "../../../common/IconBtn";
import { toast } from "react-hot-toast";

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const submitPasswordForm = async (data) => {
    try {
      const mail = user.email;
      const formData = { ...data, mail };

      if (formData.newPassword.length < 8) {
        toast.error("Minimum length of password should be 8");
        return;
      }

      if (!/\d/.test(formData.newPassword)) {
        toast.error("Password must include at least one number");
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
        toast.error("Password must include at least one special character");
        return;
      }

      const res = await changePassword(token, formData);
      if (res) {
        toast.success("Password updated successfully");
        reset();
        setShowOldPassword(false);
        setShowNewPassword(false);
      }
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)}>
      <div className="my-6 md:my-10 flex flex-col gap-y-6 rounded-md border border-richblack-700 bg-richblack-800 p-4 md:p-8 md:px-12 mx-4 md:mx-0">
        <h2 className="text-base md:text-lg font-semibold text-richblack-300">
          Change Password
        </h2>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5">
          {/* Current Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="oldPassword" className="lable-style text-white text-sm md:text-base">
              Current Password
            </label>
            <input
              type={showOldPassword ? "text" : "password"}
              id="oldPassword"
              placeholder="Enter Current Password"
              className="form-style bg-slate-900 text-white border border-gray-300 p-2 md:p-3 rounded-md pr-10 text-sm md:text-base"
              {...register("oldPassword", { required: true })}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-[32px] md:top-[38px] z-[10] cursor-pointer"
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={20} className="md:text-2xl" fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={20} className="md:text-2xl" fill="#AFB2BF" />
              )}
            </span>
            {errors.oldPassword && (
              <span className="text-[10px] md:text-[12px] text-yellow-100">
                Please enter your Current Password.
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="newPassword" className="lable-style text-white text-sm md:text-base">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              placeholder="Enter New Password"
              className="form-style bg-slate-900 text-white border border-gray-300 p-2 md:p-3 rounded-md pr-10 text-sm md:text-base"
              {...register("newPassword", { required: true })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[32px] md:top-[38px] z-[10] cursor-pointer"
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={20} className="md:text-2xl" fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={20} className="md:text-2xl" fill="#AFB2BF" />
              )}
            </span>
            {errors.newPassword && (
              <span className="text-[10px] md:text-[12px] text-yellow-100">
                Please enter your New Password.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 md:px-0">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="cursor-pointer rounded-md bg-slate-800 py-2 px-4 md:px-5 font-semibold text-richblack-300 text-sm md:text-base order-2 sm:order-1"
        >
          Cancel
        </button>
        <IconBtn type="submit" text="Update" className="order-1 sm:order-2" />
      </div>
    </form>
  );
}