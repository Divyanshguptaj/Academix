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
      <div className="my-10 flex flex-col gap-y-6 rounded-md border border-richblack-700 bg-richblack-800 p-8 px-12">
        <h2 className="text-lg font-semibold text-richblack-300">
          Change Password
        </h2>

        <div className="flex justify-between items-center ">
          {/* Current Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="oldPassword" className="lable-style text-white">
              Current Password
            </label>
            <input
              type={showOldPassword ? "text" : "password"}
              id="oldPassword"
              placeholder="Enter Current Password"
              className="form-style bg-slate-900 text-white border border-gray-300 p-2 rounded-md"
              {...register("oldPassword", { required: true })}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.oldPassword && (
              <span className="text-[12px] text-yellow-100">
                Please enter your Current Password.
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="newPassword" className="lable-style text-white">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              placeholder="Enter New Password"
              className="form-style bg-slate-900 text-white border border-gray-300 p-2 rounded-md"
              {...register("newPassword", { required: true })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.newPassword && (
              <span className="text-[12px] text-yellow-100">
                Please enter your New Password.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="cursor-pointer rounded-md bg-slate-800 py-2 px-5 font-semibold text-richblack-300"
        >
          Cancel
        </button>
        <IconBtn type="submit" text="Update" />
      </div>
    </form>
  );
}
