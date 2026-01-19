import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import signupImage from '../assets/Images/signupImage.png';
import { sendOtp } from '../services/operations/authAPI';
import { toast } from 'react-hot-toast';
import AuthTemplate from '../components/core/Auth/AuthTemplate';

const ACCOUNT_TYPE = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor'
};

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const getSignupData = () => ({ ...formData, accountType });

  const googleState = {
    mode: 'signup',
    signupData: getSignupData(),
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length<8) {
      toast.error("Minimum length of password should be 8");
      return;
    }

    if (!/\d/.test(formData.password)) {
      toast.error("Password must include at least one number");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      toast.error("Password must include at least one special character");
      return;
    }
    
    const signupData = { ...formData, accountType };

    dispatch(sendOtp(formData.email, signupData, navigate));

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setAccountType(ACCOUNT_TYPE.STUDENT);
  };

  return (
    <AuthTemplate
      title="Join StudyNotion for free"
      description={
        <>
          Build skills for today, tomorrow, and beyond.{" "}
          <span className='font-semibold text-blue-300'>Future-proof your career.</span>
        </>
      }
      imageSrc={signupImage}
      showGoogleButton={true}
      googleState={googleState}
    >

      <form className='w-full mt-5' onSubmit={handleOnSubmit}>
        {/* Name Fields */}
        <div className='flex gap-4'>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleOnChange}
            placeholder="First Name" className="w-1/2 px-4 py-3 rounded-md bg-gray-900 text-white" required />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleOnChange}
            placeholder="Last Name" className="w-1/2 px-4 py-3 rounded-md bg-gray-900 text-white" required />
        </div>

        {/* Email */}
        <input type="email" name="email" value={formData.email} onChange={handleOnChange}
          placeholder="Email Address" className="w-full px-4 py-3 mt-4 rounded-md bg-gray-900 text-white" required />

        {/* Passwords */}
        <div className='flex gap-4 mt-4'>
          <div className='relative w-1/2'>
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleOnChange}
              placeholder="Password" className="w-full px-4 py-3 rounded-md bg-gray-900 text-white" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3">
              {showPassword ? <FaRegEyeSlash className='text-gray-400 hover:text-yellow-500'/> : <FaRegEye className='text-gray-400 hover:text-yellow-500' />}
            </button>
          </div>
          <div className='relative w-1/2'>
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleOnChange}
              placeholder="Confirm Password" className="w-full px-4 py-3 rounded-md bg-gray-900 text-white" required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3">
              {showConfirmPassword ? <FaRegEyeSlash className='text-gray-400 hover:text-yellow-500'/> : <FaRegEye className='text-gray-400 hover:text-yellow-500' />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="mt-6 w-full bg-yellow-500 text-black font-bold py-3 rounded-md hover:bg-yellow-600">
          Sign up
        </button>
      </form>
    </AuthTemplate>
  );
};

export default Signup;
