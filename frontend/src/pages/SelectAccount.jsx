import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SelectAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const mode = state?.mode || 'login'; // 'signup' | 'login'
  const signupData = state?.signupData || null;
  const initialEmail = signupData?.email || state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!email) {
      toast.error('Please provide an email to proceed');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/google/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode, signupData }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        // store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        toast.success('Authentication successful');
        navigate('/'); // adjust to dashboard route if needed
      } else {
        toast.error(data?.message || 'Validation failed');
      }
    } catch (err) {
      toast.error('Server error during validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-md">
        <h2 className="text-xl font-semibold mb-4">{mode === 'signup' ? 'Complete signup with Google' : 'Login with Google'}</h2>
        <p className="text-sm mb-4">Confirm the account/email you want to use for {mode}.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Google account email"
          className="w-full px-3 py-2 rounded-md bg-gray-900 text-white mb-4"
        />

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-2 rounded-md bg-yellow-500 text-black font-bold"
        >
          {loading ? 'Processing...' : mode === 'signup' ? 'Complete Signup' : 'Confirm & Login'}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-3 w-full py-2 rounded-md bg-gray-700 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SelectAccount;
