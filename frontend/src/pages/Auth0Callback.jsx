import { useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { googleLogin, checkGoogleUserAndLogin } from '../services/operations/authAPI';

const Auth0Callback = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAuthSuccess = useCallback(async () => {
    sessionStorage.removeItem('authMode');

    const googleUserData = {
      email: user.email,
      firstName: user.given_name || user.name?.split(' ')[0] || 'User',
      lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
      picture: user.picture,
      auth0Id: user.sub,
    };

    try {
      // Check if user already has an Academix account
      await checkGoogleUserAndLogin(googleUserData);

      // Account exists → log in and set Redux state
      dispatch(googleLogin(googleUserData));
    } catch (err) {
      if (err.response?.status === 404) {
        // No account yet → collect account type + password before creating one
        sessionStorage.setItem('googleUserData', JSON.stringify(googleUserData));
        navigate('/setup-password', { state: { googleUserData } });
      } else {
        console.error('Google auth error:', err);
        toast.error('Google sign-in failed. Please try again.');
        navigate('/login');
      }
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error('Auth0 error:', error);
      toast.error(`Authentication failed: ${error.message}`);
      navigate('/login');
      return;
    }

    if (isAuthenticated && user) {
      handleAuthSuccess();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, error, user, navigate, handleAuthSuccess]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121220]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-white text-lg font-medium">Signing you in…</p>
        <p className="text-gray-400 text-sm mt-1">Please wait while we verify your account</p>
      </div>
    </div>
  );
};

export default Auth0Callback;
