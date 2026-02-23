import { useState, useEffect } from 'react';
// Note: accountType is always 'Student' at signup — instructors apply via dashboard
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import signupImage from '../assets/Images/signupImage.png';
import { sendOtp } from '../services/operations/authAPI';
import { toast } from 'react-hot-toast';
import AuthTemplate from '../components/core/Auth/AuthTemplate';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleOnChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Minimum password length is 8 characters');
      return;
    }
    if (!/\d/.test(formData.password)) {
      toast.error('Password must include at least one number');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      toast.error('Password must include at least one special character');
      return;
    }

    // All signups are Students — instructors apply via dashboard
    const signupData = { ...formData, accountType: 'Student' };
    dispatch(sendOtp(formData.email, signupData, navigate));

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <AuthTemplate
      title="Join Academix for free"
      description={
        <>
          Build skills for today, tomorrow, and beyond.{' '}
          <span className="font-semibold text-blue-300">Future-proof your career.</span>
        </>
      }
      imageSrc={signupImage}
      showGoogleButton={true}
      onGoogleClick={() => sessionStorage.setItem('accountType', 'Student')}
      footerLink={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleOnSubmit} className="flex flex-col gap-4">
        {/* Name row */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="lable-style">
              First name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleOnChange}
              placeholder="John"
              className="form-style"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="lable-style">
              Last name <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleOnChange}
              placeholder="Doe"
              className="form-style"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="lable-style">
            Email address <span className="text-pink-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleOnChange}
            placeholder="you@example.com"
            className="form-style"
            required
          />
        </div>

        {/* Passwords row */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="lable-style">
              Password <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleOnChange}
                placeholder="Min. 8 chars"
                className="form-style pr-9"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                {showPassword ? <FaRegEyeSlash size={15} /> : <FaRegEye size={15} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="lable-style">
              Confirm <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleOnChange}
                placeholder="Repeat password"
                className="form-style pr-9"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                {showConfirmPassword ? <FaRegEyeSlash size={15} /> : <FaRegEye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full bg-yellow-400 text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-300 active:scale-[0.98] transition-all duration-150"
        >
          Create account
        </button>
      </form>
    </AuthTemplate>
  );
};

export default Signup;
