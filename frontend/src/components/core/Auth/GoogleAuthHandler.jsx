import { useEffect, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../../slices/authSlice';
import { setUser } from '../../../slices/profileSlice';
import { apiConnector } from '../../../services/apiconnector';
import { endpoints } from '../../../services/apis';

const { GOOGLE_AUTH_API } = endpoints;

const GoogleAuthHandler = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // User authenticated with Auth0, now sync with backend
      // Check the mode from sessionStorage to determine login vs signup
      const appState = JSON.parse(sessionStorage.getItem('auth0.redirect.state') || '{}');
      const { mode } = appState;

      if (mode === 'login' || !mode) {
        // For login, try to authenticate directly without password modal
        handleGoogleAuthForLogin();
      } else {
        // For signup, show password form
        setShowPasswordForm(true);
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handleGoogleAuthForLogin = async () => {
    if (!user) return;

    try {
      const userData = {
        firstName: user.given_name || user.name?.split(' ')[0] || '',
        lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        password: 'google_login_temp', // Dummy password for existing users
        image: user.picture,
      };

      setIsSubmitting(true);

      const response = await apiConnector('POST', GOOGLE_AUTH_API, { ...userData, mode: 'login' });

      if (response.data.success) {
        // User exists, login successful
        dispatch(setToken(response.data.token));
        const userImage = response.data?.user?.image
          ? response.data.user.image
          : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
        dispatch(setUser({ ...response.data.user, image: userImage }));

        localStorage.setItem("token", JSON.stringify(response.data.token));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard/my-profile");
      } else {
        // User doesn't exist, redirect to signup
        navigate('/signup');
        alert('Account not found. Please sign up first.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      // If login fails, redirect to signup
      navigate('/signup');
      alert('Login failed. Please sign up if you don\'t have an account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!user) return;

    try {
      // Check if this is a new user or returning user
      // For new users, show password form
      // For existing users, directly login

      const userData = {
        firstName: user.given_name || user.name?.split(' ')[0] || '',
        lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        password: password || 'temp_password_123', // Temporary password for new users
        image: user.picture,
      };

      if (!showPasswordForm) {
        // First time - show password form for new users
        setShowPasswordForm(true);
        return;
      }

      // User has entered password, proceed with auth
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }

      setIsSubmitting(true);

      const response = await apiConnector('POST', GOOGLE_AUTH_API, {
        ...userData,
        password, // Use the entered password
        mode: 'signup'
      });

      if (response.data.success) {
        dispatch(setToken(response.data.token));
        const userImage = response.data?.user?.image
          ? response.data.user.image
          : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
        dispatch(setUser({ ...response.data.user, image: userImage }));

        localStorage.setItem("token", JSON.stringify(response.data.token));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard/my-profile");
      } else {
        alert(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password && confirmPassword) {
      handleGoogleAuth();
    }
  };

  if (showPasswordForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Account</h2>
          <div className="mb-4">
            <p className="text-gray-300 mb-2">Welcome, {user?.name}!</p>
            <p className="text-gray-400 text-sm">Email: {user?.email}</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4 relative">
              <label className="block text-white mb-2">Create Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white pr-10"
                placeholder="Enter password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-yellow-500"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>

            <div className="mb-6 relative">
              <label className="block text-white mb-2">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white pr-10"
                placeholder="Confirm password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-yellow-500"
              >
                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-black font-bold py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Signup'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null; // Don't render anything if not handling auth
};

export default GoogleAuthHandler;
