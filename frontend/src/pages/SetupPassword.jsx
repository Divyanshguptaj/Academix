import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { googleSignupFinalize } from '../services/operations/authAPI';

const SetupPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const googleUserData = location.state?.googleUserData || JSON.parse(sessionStorage.getItem('googleUserData') || '{}');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (!/\d/.test(password)) {
      toast.error('Password must include a number');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must include a special character');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsSubmitting(true);

    const signupData = {
      ...googleUserData,
      password,
      accountType: 'Student',
    };

    console.log('SetupPassword - Submitting:', signupData);

    try {
      const action = googleSignupFinalize(signupData, navigate);
      await dispatch(action);
    } catch (err) {
      console.error('Signup error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-richblack-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12 pt-24 md:pt-28">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Side - Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Secure Your Account</h1>
              <p className="text-gray-300 text-lg mb-2">
                Welcome, <span className="font-semibold text-yellow-400">{googleUserData?.firstName}!</span>
              </p>
              <p className="text-gray-400">Create a strong password to complete your signup.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label className="block">
                  <p className="text-sm font-semibold text-white mb-2">
                    Password <sup className="text-pink-400">*</sup>
                  </p>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="w-full px-4 py-3 rounded-lg bg-richblack-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-richblack-500 transition autofill:bg-richblack-700 autofill:text-white"
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #1f2937 inset',
                        WebkitTextFillColor: '#ffffff'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-gray-400 hover:text-yellow-400 transition"
                    >
                      {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                    </button>
                  </div>
                </label>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block">
                  <p className="text-sm font-semibold text-white mb-2">
                    Confirm Password <sup className="text-pink-400">*</sup>
                  </p>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 rounded-lg bg-richblack-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-richblack-500 transition autofill:bg-richblack-700 autofill:text-white"
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #1f2937 inset',
                        WebkitTextFillColor: '#ffffff'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3 text-gray-400 hover:text-yellow-400 transition"
                    >
                      {showConfirmPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                    </button>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-richblack-900 font-bold py-3 px-6 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Signup'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-richblack-700 hover:bg-richblack-600 text-white font-semibold py-3 px-6 rounded-lg border border-richblack-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Requirements & Info */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Password Requirements Card */}
            <div className="bg-gradient-to-br from-richblack-700 to-richblack-800 rounded-xl p-6 border border-richblack-600">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">✓</span> Password Requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-400 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">At least 8 characters</p>
                    <p className="text-gray-500 text-sm">Make it long for better security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-400 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">One number (0-9)</p>
                    <p className="text-gray-500 text-sm">Example: password123</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-400 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">One special character</p>
                    <p className="text-gray-500 text-sm">Example: !@#$%^&*</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 backdrop-blur-sm">
              <h4 className="text-blue-200 font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span> Pro Tip
              </h4>
              <p className="text-blue-100 text-sm">
                This password lets you sign in with your email, in addition to using Google authentication. Keep it safe!
              </p>
            </div>

            {/* Security Info */}
            <div className="bg-green-900/20 rounded-xl p-6 border border-green-700/50 backdrop-blur-sm">
              <h4 className="text-green-200 font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">🔒</span> Security
              </h4>
              <p className="text-green-100 text-sm">
                Your password is encrypted and stored securely. We never share your data.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SetupPassword;
