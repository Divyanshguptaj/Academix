import { useAuth0 } from '@auth0/auth0-react';
import { useLocation, Link } from 'react-router-dom';
import loginBackground from '../../../assets/Images/loginBackground.png';

const AuthTemplate = ({
  title,
  description,
  imageSrc,
  showGoogleButton = false,
  onGoogleClick,
  footerLink,
  children,
}) => {
  const { loginWithRedirect } = useAuth0();
  const location = useLocation();

  const handleGoogleClick = () => {
    if (onGoogleClick) onGoogleClick();
    const isSignupPage = location.pathname === '/signup';
    sessionStorage.setItem('authMode', isSignupPage ? 'signup' : 'login');
    loginWithRedirect({
      authorizationParams: { connection: 'google-oauth2' },
    });
  };

  return (
    <div className="min-h-screen bg-[#121220] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        {/* ── Form column ── */}
        <div className="w-full lg:w-[460px] flex-shrink-0">

          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-1 mb-8 group">
            <span className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors">
              Academix
            </span>
            <span className="text-yellow-400 text-2xl font-black">.</span>
          </Link>

          <div className="bg-[#1d1d1d] border border-gray-800 rounded-2xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
            )}

            {/* Google button */}
            {showGoogleButton && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
                >
                  {/* Google G logo */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center my-5">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="px-3 text-gray-500 text-xs uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>
              </>
            )}

            {children}
          </div>

          {/* Footer link (e.g. "Don't have an account?") */}
          {footerLink && (
            <p className="text-center text-sm text-gray-400 mt-5">{footerLink}</p>
          )}
        </div>

        {/* ── Decorative image column (hidden on mobile) ── */}
        <div className="hidden lg:flex flex-1 justify-center items-center">
          <div className="relative w-full max-w-sm h-[420px] flex items-center justify-center">
            <img
              src={loginBackground}
              alt=""
              className="absolute w-[90%] z-0 opacity-70 object-contain"
              style={{ top: '50%', left: '50%', transform: 'translate(-42%, -46%)' }}
            />
            <img
              src={imageSrc}
              alt="Auth illustration"
              className="relative z-10 w-[85%] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthTemplate;
