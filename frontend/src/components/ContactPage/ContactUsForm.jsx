import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CountryCode from "../../data/countrycode.json";
import { apiConnector } from "../../services/apiconnector";
import { contactusEndpoint } from "../../services/apis";

const SearchableCountrySelect = ({ register, setValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    CountryCode.find((c) => c.code === "IN") || CountryCode[0]
  );
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Keep hidden field in sync
  useEffect(() => {
    setValue("countrycode", selected.dial_code);
  }, [selected, setValue]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const filtered = CountryCode.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dial_code.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Hidden registered field so RHF includes countrycode in form data */}
      <input type="hidden" {...register("countrycode")} />

      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="form-style flex items-center justify-between gap-2 cursor-pointer w-44"
      >
        <span className="truncate text-sm">
          {selected.dial_code} — {selected.name}
        </span>
        <span className="text-gray-400 text-xs flex-shrink-0">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-1 w-64 rounded-lg border border-gray-700 bg-[#1d1d1d] shadow-xl overflow-hidden">
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search country or code…"
            className="w-full px-3 py-2 bg-[#121220] text-sm text-white placeholder:text-gray-500 border-b border-gray-700 focus:outline-none"
          />
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            ) : (
              filtered.map((c, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setSelected(c);
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                    c.code === selected.code
                      ? "bg-yellow-400/10 text-yellow-400"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {c.dial_code} — {c.name}
                </li>
              ))
            )}
          </ul>
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
    formState: { errors },
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );
      if (!res?.data?.success)
        throw new Error(res?.data?.message || "Submission failed");

      toast.success("Message sent successfully!");
      // Reset only on success — not using isSubmitSuccessful which is always true
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
        countrycode: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send message."
      );
      console.error("Contact form error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(submitContactForm)}
    >
      {/* First + Last name */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="firstname" className="lable-style">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            id="firstname"
            type="text"
            placeholder="Enter first name"
            className="form-style"
            {...register("firstname", { required: "First name is required" })}
          />
          {errors.firstname && (
            <p className="text-xs text-red-400">{errors.firstname.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="lastname" className="lable-style">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            id="lastname"
            type="text"
            placeholder="Enter last name"
            className="form-style"
            {...register("lastname", { required: "Last name is required" })}
          />
          {errors.lastname && (
            <p className="text-xs text-red-400">{errors.lastname.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="lable-style">
          Email Address <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter email address"
          className="form-style"
          {...register("email", { required: "Email address is required" })}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Phone number */}
      <div className="flex flex-col gap-1.5">
        <label className="lable-style">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <div className="flex items-start gap-3">
          <SearchableCountrySelect register={register} setValue={setValue} />
          <div className="flex-1 flex flex-col gap-1">
            <input
              id="phonenumber"
              type="tel"
              placeholder="12345 67890"
              className="form-style"
              {...register("phoneNo", {
                required: "Phone number is required",
                minLength: { value: 10, message: "Invalid phone number" },
                maxLength: { value: 12, message: "Invalid phone number" },
              })}
            />
            {errors.phoneNo && (
              <p className="text-xs text-red-400">{errors.phoneNo.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="lable-style">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder="Enter your message here"
          className="form-style resize-none"
          {...register("message", { required: "Message is required" })}
        />
        {errors.message && (
          <p className="text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-yellow-300 hover:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
};

export default ContactUsForm;
