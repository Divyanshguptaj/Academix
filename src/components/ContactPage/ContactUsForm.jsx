import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CountryCode from "../../data/countrycode.json";
import { apiConnector } from "../../services/apiconnector";
import { contactusEndpoint } from "../../services/apis";

const SearchableCountrySelect = ({ register, setValue, defaultValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    CountryCode.find(country => country.code === "IN") || CountryCode[0]
  );
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    setValue("countrycode", selectedCountry.dial_code);
  }, [selectedCountry, setValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const filteredCountries = CountryCode.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dial_code.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country) => {
    setSelectedCountry(country);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2 cursor-pointer flex justify-between items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
        style={{ minWidth: '200px' }}
      >
        <span className="truncate flex-1 mr-2">{selectedCountry.dial_code} - {selectedCountry.name}</span>
        <span>▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border border-gray-300 rounded-md mt-1 z-10 max-h-60 overflow-y-auto min-w-[200px] transition-all duration-200 ease-in-out opacity-100 scale-100">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search country or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-slate-800 text-white border-b border-gray-300 rounded-t-md"
            onClick={(e) => e.stopPropagation()}
          />
          {filteredCountries.map((country, index) => (
            <div
              key={index}
              className="p-2 hover:bg-slate-800 cursor-pointer text-white"
              onClick={() => handleSelect(country)}
            >
              {country.dial_code} - {country.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);

      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Submission failed");
      }

      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message.");
      console.error("ERROR MESSAGE - ", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
        countrycode: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  return (
    <form
      className="flex flex-col gap-7"
      onSubmit={handleSubmit(submitContactForm)}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="firstname" className="lable-style font-light">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter first name"
            className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2"
            {...register("firstname", { required: true })}
          />
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-yellow-100">
              Please enter your name.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="lastname" className="lable-style font-light">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter last name"
            className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2"
            {...register("lastname")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="lable-style font-light">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter email address"
          className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Email address.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phonenumber" className="lable-style font-light">
          Phone Number
        </label>

        <div className="flex gap-5">
          <div className="flex w-[200px] flex-col gap-2">
            <SearchableCountrySelect
              register={register}
              setValue={setValue}
            />
          </div>
          <div className="flex w-[calc(100%-210px)] flex-col gap-2">
            <input
              type="tel"
              name="phoneNo"
              id="phonenumber"
              placeholder="12345 67890"
              className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2"
              {...register("phoneNo", {
                required: {
                  value: true,
                  message: "Please enter your Phone Number.",
                },
                maxLength: { value: 12, message: "Invalid Phone Number" },
                minLength: { value: 10, message: "Invalid Phone Number" },
              })}
            />
          </div>
        </div>
        {errors.phoneNo && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            {errors.phoneNo.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="lable-style font-light">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          cols="30"
          rows="7"
          placeholder="Enter your message here"
          className="form-style bg-slate-900 rounded-md text-white border border-1 border-gray-300 p-2"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Message.
          </span>
        )}
      </div>

      <button
        disabled={loading}
        type="submit"
        className={`rounded-md bg-yellow-500 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${
           !loading &&
           "transition-all duration-200 hover:scale-95 hover:shadow-none"
         }  disabled:bg-richblack-500 sm:text-[16px] `}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactUsForm;
