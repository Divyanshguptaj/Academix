import React from 'react';

/**
 * GoogleAuthHandler - DEPRECATED
 * 
 * This component is no longer used. The Google authentication flow now uses:
 * 1. AuthTemplate - for Google button and initial redirect
 * 2. Auth0Callback - for handling Auth0 redirect and determining login vs signup
 * 3. SetupPassword - for password setup during signup
 * 
 * This component is kept for backwards compatibility but returns null.
 */
const GoogleAuthHandler = () => {
  return null;
};

export default GoogleAuthHandler;
