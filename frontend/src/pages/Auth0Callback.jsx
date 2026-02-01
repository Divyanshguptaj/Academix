import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { googleLogin, checkGoogleUserAndLogin } from '../services/operations/authAPI';

const Auth0Callback = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error('Auth0 Error:', error);
      toast.error(`Authentication failed: ${error.message}`);
      navigate('/login');
      return;
    }

    if (isAuthenticated && user) {
      handleAuthSuccess();
    } else if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, error, user, navigate, dispatch]);

  const handleAuthSuccess = async () => {
    try {
      const authMode = sessionStorage.getItem('authMode') || 'login';
      
      // Extract user data from Auth0
      // console.log("user", user);
      const googleUserData = {
        email: user.email,
        firstName: user.given_name || user.name?.split(' ')[0] || 'User',
        lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
        picture: user.picture,
        auth0Id: user.sub,
      };

      // console.log('Auth0 Callback - Mode:', authMode);
      // console.log('Auth0 Callback - User:', googleUserData);

      sessionStorage.removeItem('authMode');

      if (authMode === 'signup') {
        // Try to login first (in case user already exists)
        try {
          console.log('Attempting login for signup user...');
          await checkGoogleUserAndLogin(googleUserData);
          
          // User exists - log them in
          dispatch(googleLogin(googleUserData));
        } catch (loginErr) {
          // User doesn't exist - go to password setup
          sessionStorage.setItem('googleUserData', JSON.stringify(googleUserData));
          navigate('/setup-password', { state: { googleUserData } });
        }
      } else {
        // Direct login
        dispatch(googleLogin(googleUserData));
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-richblack-900">
      <div className="text-white text-lg text-center">
        <p>Processing authentication...</p>
      </div>
    </div>
  );
};

export default Auth0Callback;
