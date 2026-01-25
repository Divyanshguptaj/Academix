import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';
import loginBackground from '../../../assets/Images/loginBackground.png';

const AuthTemplate = ({ title, description, imageSrc, showGoogleButton = false, onGoogleClick, children }) => {
  const { loginWithRedirect } = useAuth0();
  const location = useLocation();

  const handleGoogleClick = () => {
    // Call parent's callback if provided (e.g., to store accountType)
    if (onGoogleClick) {
      onGoogleClick();
    }

    // Determine if this is a login or signup page
    const isSignupPage = location.pathname === '/signup';
    
    // Store mode in sessionStorage - this is what Auth0Callback will read
    sessionStorage.setItem('authMode', isSignupPage ? 'signup' : 'login');

    // Redirect to Auth0 login with Google connection
    loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  };

  return (
    <div className='bg-richblack-900 flex justify-center items-center w-full min-h-screen py-10'>
      <div className='flex flex-wrap justify-center items-center gap-12 w-5/6'>

        {/* Left Section (Form) */}
        <div className='flex flex-col w-[40%] p-10 bg-gray-800 rounded-lg shadow-lg'>
          <p className='text-3xl text-white font-bold text-center'>{title}</p>
          <p className='text-sm text-gray-300 mt-3 text-center'>
            {description}
          </p>

          {/* Google Login Button */}
          {showGoogleButton && (
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full bg-white text-gray-900 font-medium py-3 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-3 mt-6 border border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {/* Divider */}
          {showGoogleButton && (
            <div className="flex items-center mt-6 mb-4">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>
          )}

          {children}
        </div>

        {/* Right Section (Image) */}
        <div className='w-[40%] flex justify-center items-center'>
          <div className='relative w-full'>
            <img src={loginBackground} alt="Background" className='absolute w-5/6 z-0 object-cover translate-x-4 translate-y-[-46%]' />
            <img src={imageSrc} alt="Auth" className='absolute w-5/6 z-10 object-cover translate-y-[-50%]' />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthTemplate;
