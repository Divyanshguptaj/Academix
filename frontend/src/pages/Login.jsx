import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import loginImage from "../assets/Images/loginImage.png";
import { toast } from "react-hot-toast";
import AuthTemplate from "../components/core/Auth/AuthTemplate";
import { login } from "../services/operations/authAPI";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleOnChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(login(formData.email, formData.password, navigate));
    setFormData({ email: "", password: "" });
  };

  return (
    <AuthTemplate
      title="Welcome back"
      description="Log in to your Academix account to continue learning."
      imageSrc={loginImage}
      showGoogleButton={true}
      footerLink={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Sign up for free
          </Link>
        </>
      }
    >
      <form onSubmit={handleOnSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="lable-style">
            Email address <span className="text-pink-400">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleOnChange}
            placeholder="you@example.com"
            className="form-style"
            required
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="lable-style">
              Password <span className="text-pink-400">*</span>
            </label>
            <Link
              to="/forgotPassword"
              className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleOnChange}
              placeholder="Enter your password"
              className="form-style pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-300 active:scale-[0.98] transition-all duration-150"
        >
          Log in
        </button>
      </form>
    </AuthTemplate>
  );
};

export default Login;
