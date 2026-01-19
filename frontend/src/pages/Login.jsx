import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import loginImage from "../assets/Images/loginImage.png";
import { toast } from "react-hot-toast";
import AuthTemplate from "../components/core/Auth/AuthTemplate";
import { login } from "../services/operations/authAPI"; // Assuming you have a login API call

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const googleState = {
    mode: "login",
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Dispatch your regular login action here
    dispatch(login(formData.email, formData.password, navigate));

    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <AuthTemplate
      title="Welcome back"
      description="Login to your StudyNotion account"
      imageSrc={loginImage}
      showGoogleButton={true}
      googleState={googleState} // Pass googleState for login mode
    >
      <form className="w-full mt-5" onSubmit={handleOnSubmit}>
        {/* Email */}
        <label className="w-full">
          <p className="text-[0.875rem] text-white mb-1 leading-[1.375rem]">
            Email Address{" "}
            <sup className="text-pink-200">*</sup>
          </p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full px-4 py-3 rounded-md bg-gray-900 text-white"
            required
          />
        </label>

        {/* Password */}
        <label className="relative mt-4 w-full">
          <p className="text-[0.875rem] text-white mb-1 leading-[1.375rem]">
            Password{" "}
            <sup className="text-pink-200">*</sup>
          </p>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleOnChange}
            placeholder="Enter Password"
            className="w-full px-4 py-3 rounded-md bg-gray-900 text-white"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] cursor-pointer text-gray-400 hover:text-yellow-500"
          >
            {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-6 w-full bg-yellow-500 text-black font-bold py-3 rounded-md hover:bg-yellow-600"
        >
          Login
        </button>
      </form>
    </AuthTemplate>
  );
};

export default Login;
