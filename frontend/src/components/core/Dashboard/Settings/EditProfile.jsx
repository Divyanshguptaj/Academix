import { useForm, Controller } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/settingsAPI"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  FiUser, FiCalendar, FiPhone, FiFileText, FiSave, FiX
} from "react-icons/fi"
import { BsGenderAmbiguous } from "react-icons/bs"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

const inputClass =
  "w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 text-sm placeholder:text-richblack-400 focus:outline-none focus:border-yellow-400/60 transition-colors"

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitProfileForm = async (data) => {
    try {
      if (data.dateOfBirth instanceof Date) {
        data.dateOfBirth = data.dateOfBirth.toISOString().split("T")[0]
      }
      dispatch(updateProfile(user.email, data, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <style>{`
        .dob-picker .react-datepicker {
          background-color: #1d1d1d;
          border: 1px solid #3A3A3A;
          border-radius: 12px;
          font-family: inherit;
          overflow: hidden;
        }
        .dob-picker .react-datepicker__header {
          background-color: #262626;
          border-bottom: 1px solid #3A3A3A;
          padding: 12px 8px 8px;
        }
        .dob-picker .react-datepicker__current-month,
        .dob-picker .react-datepicker-year-header {
          color: #fcd34d;
          font-size: 14px;
          font-weight: 600;
        }
        .dob-picker .react-datepicker__day-name {
          color: #9E9E9E;
          font-size: 12px;
          width: 2rem;
          line-height: 2rem;
        }
        .dob-picker .react-datepicker__day {
          color: #F9F9F9;
          border-radius: 6px;
          width: 2rem;
          line-height: 2rem;
          font-size: 13px;
        }
        .dob-picker .react-datepicker__day:hover {
          background-color: #3A3A3A;
          color: #fcd34d;
        }
        .dob-picker .react-datepicker__day--selected,
        .dob-picker .react-datepicker__day--keyboard-selected {
          background-color: #fcd34d;
          color: #1d1d1d;
          font-weight: 600;
        }
        .dob-picker .react-datepicker__day--selected:hover {
          background-color: #f59e0b;
          color: #1d1d1d;
        }
        .dob-picker .react-datepicker__day--outside-month { color: #6E6E6E; }
        .dob-picker .react-datepicker__day--disabled { color: #3A3A3A; cursor: not-allowed; }
        .dob-picker .react-datepicker__navigation-icon::before { border-color: #9E9E9E; }
        .dob-picker .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before { border-color: #fcd34d; }
        .dob-picker .react-datepicker__month-dropdown,
        .dob-picker .react-datepicker__year-dropdown {
          background-color: #1d1d1d;
          border: 1px solid #3A3A3A;
          border-radius: 8px;
        }
        .dob-picker .react-datepicker__month-option,
        .dob-picker .react-datepicker__year-option { color: #F9F9F9; padding: 4px 12px; }
        .dob-picker .react-datepicker__month-option:hover,
        .dob-picker .react-datepicker__year-option:hover { background-color: #3A3A3A; color: #fcd34d; }
        .dob-picker .react-datepicker__month-option--selected_month,
        .dob-picker .react-datepicker__year-option--selected_year {
          background-color: #262626; color: #fcd34d; font-weight: 600;
        }
        .dob-picker .react-datepicker__month-read-view,
        .dob-picker .react-datepicker__year-read-view {
          color: #F9F9F9; font-size: 13px; font-weight: 600;
          border-bottom: 1px dashed #6E6E6E;
        }
        .dob-picker .react-datepicker__month-read-view--down-arrow,
        .dob-picker .react-datepicker__year-read-view--down-arrow { border-top-color: #9E9E9E; top: 4px; }
        .dob-picker .react-datepicker__month-select,
        .dob-picker .react-datepicker__year-select {
          background-color: #262626;
          color: #fcd34d;
          border: 1px solid #3A3A3A;
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }
        .dob-picker .react-datepicker__month-select option,
        .dob-picker .react-datepicker__year-select option {
          background-color: #1d1d1d;
          color: #F9F9F9;
        }
      `}</style>

      <form onSubmit={handleSubmit(submitProfileForm)}>
        <div className="my-6 md:my-10 rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden mx-4 md:mx-0">

          {/* Section Header */}
          <div className="flex items-center gap-3 px-6 md:px-10 py-5 border-b border-richblack-700">
            <div className="w-9 h-9 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUser className="text-yellow-400 text-base" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-richblack-5">Personal Information</h2>
              <p className="text-xs text-richblack-400 mt-0.5">Update your name, bio and contact details</p>
            </div>
          </div>

          <div className="px-6 md:px-10 py-6 flex flex-col gap-5">

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <FiUser className="text-richblack-400 text-xs" /> First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Enter first name"
                  className={inputClass}
                  {...register("firstName", { required: true })}
                  defaultValue={user?.firstName}
                />
                {errors.firstName && (
                  <span className="text-[11px] text-yellow-300">Please enter your first name.</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <FiUser className="text-richblack-400 text-xs" /> Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Enter last name"
                  className={inputClass}
                  {...register("lastName", { required: true })}
                  defaultValue={user?.lastName}
                />
                {errors.lastName && (
                  <span className="text-[11px] text-yellow-300">Please enter your last name.</span>
                )}
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 dob-picker">
                <label htmlFor="dateOfBirth" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <FiCalendar className="text-richblack-400 text-xs" /> Date of Birth
                </label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  defaultValue={
                    user?.additionalDetails?.dateOfBirth
                      ? new Date(user.additionalDetails.dateOfBirth)
                      : null
                  }
                  rules={{
                    required: "Please enter your Date of Birth.",
                    validate: (val) =>
                      !val || val <= new Date() || "Date of Birth cannot be in the future.",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      id="dateOfBirth"
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/MM/yyyy"
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      placeholderText="DD/MM/YYYY"
                      className={inputClass}
                      wrapperClassName="w-full"
                      popperClassName="z-50"
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <span className="text-[11px] text-yellow-300">{errors.dateOfBirth.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gender" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <BsGenderAmbiguous className="text-richblack-400 text-xs" /> Gender
                </label>
                <select
                  id="gender"
                  className={`${inputClass} cursor-pointer`}
                  {...register("gender", { required: true })}
                  defaultValue={user?.additionalDetails?.gender}
                >
                  {genders.map((g) => (
                    <option key={g} value={g} className="bg-richblack-700">{g}</option>
                  ))}
                </select>
                {errors.gender && (
                  <span className="text-[11px] text-yellow-300">Please select your gender.</span>
                )}
              </div>
            </div>

            {/* Contact Number & About */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contactNumber" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <FiPhone className="text-richblack-400 text-xs" /> Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  placeholder="Enter contact number"
                  className={inputClass}
                  {...register("contactNumber", {
                    required: { value: true, message: "Please enter your Contact Number." },
                    maxLength: { value: 12, message: "Invalid Contact Number" },
                    minLength: { value: 10, message: "Invalid Contact Number" },
                  })}
                  defaultValue={user?.additionalDetails?.contactNumber}
                />
                {errors.contactNumber && (
                  <span className="text-[11px] text-yellow-300">{errors.contactNumber.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="about" className="text-sm font-medium text-richblack-300 flex items-center gap-1.5">
                  <FiFileText className="text-richblack-400 text-xs" /> About
                </label>
                <input
                  type="text"
                  id="about"
                  placeholder="A short bio about yourself"
                  className={inputClass}
                  {...register("about", { required: true })}
                  defaultValue={user?.additionalDetails?.about}
                />
                {errors.about && (
                  <span className="text-[11px] text-yellow-300">Please enter your About.</span>
                )}
              </div>
            </div>
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
            <FiSave className="text-sm" /> Save Changes
          </button>
        </div>
      </form>
    </>
  )
}
