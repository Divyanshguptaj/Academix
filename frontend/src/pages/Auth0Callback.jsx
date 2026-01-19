import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { googleLogin, googleSignupFinalize } from '../services/operations/authAPI'; // New API calls

const Auth0Callback = () => {
  const { user, isAuthenticated, isLoading, error, getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthResult = async () => {
      if (isLoading) {
        // Still loading Auth0 SDK or user data
        return;
      }
      if (error) {
        toast.error(`Auth0 Error: ${error.message}`);
        navigate('/login'); // Redirect to login on error
        return;
      }
      if (isAuthenticated && user) {
        try {
          // Attempt to get the access token for your custom API
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Ensure audience is correct
            },
          });
          
          // Access the appState from local storage, as it's not directly in useAuth0
          // NOTE: Auth0 SDK stores appState in session storage usually.
          // This is a common workaround if you need direct access after redirect.
          // Better approach is to rely on backend to process state from Auth0 redirect
          const appState = JSON.parse(sessionStorage.getItem('auth0.redirect.state') || '{}');
          const { mode, signupData } = appState;

          const googleUserData = {
            email: user.email,
            firstName: user.given_name || (signupData?.firstName || ''),
            lastName: user.family_name || (signupData?.lastName || ''),
            picture: user.picture,
            auth0Id: user.sub, // Auth0 user ID
          };

          if (mode === 'signup') {
            // Combine googleUserData with any pre-filled signupData
            const combinedSignupData = { ...googleUserData, ...signupData };
            // Dispatch backend call to finalize signup (e.g., store in your DB, send OTP)
            dispatch(googleSignupFinalize(combinedSignupData, accessToken, navigate));
          } else if (mode === 'login') {
            // Dispatch backend call to log in the user
            dispatch(googleLogin(googleUserData.email, accessToken, navigate));
          } else {
            // Default action if no specific mode is set, perhaps just navigate to dashboard
            toast.success("Logged in successfully with Google!");
            navigate('/dashboard'); // Or your default logged-in page
          }
        } catch (err) {
          toast.error("Failed to process Google authentication.");
          console.error("Error processing Auth0 callback:", err);
          navigate('/login');
        }
      } else if (!isLoading && !isAuthenticated) {
        // If not authenticated and not loading, something went wrong or user cancelled
        // You might want to automatically redirect them to login if this happens unexpectedly
        // navigate('/login'); 
      }
    };

    handleAuthResult();
  }, [isAuthenticated, isLoading, user, error, navigate, dispatch, getAccessTokenSilently]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="text-white text-lg">
        {isLoading ? (
          <p>Processing Google authentication...</p>
        ) : error ? (
          <p>Authentication failed: {error.message}</p>
        ) : (
          <p>Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default Auth0Callback;
