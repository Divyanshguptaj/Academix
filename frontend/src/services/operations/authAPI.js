import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../slices/authSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiconnector"
import { endpoints } from "../apis"
import axios from "axios"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

export function sendOtp(email, signupData, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", SENDOTP_API, { email });

      console.log("SENDOTP API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("OTP Sent Successfully");

      navigate("/verifyEmail", { state: { email, signupData } });

    } catch (error) {
      console.log("SENDOTP API ERROR............", error);
      toast.error("Could Not Send OTP");
    }

    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function signUp(fullSignupData) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await axios.post(SIGNUP_API, fullSignupData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("SIGNUP API RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful");
      return { success: true, message: "Signup successful" };
    } catch (error) {
      console.log("SIGNUP API ERROR:", error);

      toast.error(error.response?.data?.message || "Signup Failed");
      return { success: false, message: error.response?.data?.message || "Signup failed" }; 
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      if (!response.data.success) {
        console.log(response.data.message)
        throw new Error(response.data.message)
      }

      toast.success("Login Successful")
      dispatch(setToken(response.data.token))
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
      dispatch(setUser({ ...response.data.user, image: userImage }))
      
      localStorage.setItem("token", JSON.stringify(response.data.token))
      localStorage.setItem("user", JSON.stringify(response.data.user))
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("LOGIN API ERROR............", error)
      toast.error(error.response.data.message)
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    localStorage.clear(); // Clears all stored items
    // dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}

export function getPasswordResetToken(email , setEmailSent,navigate) {
  return async(dispatch) => {
    dispatch(setLoading(true));
    try{

      const response = await apiConnector("POST", RESETPASSTOKEN_API, {email})

      console.log("RESET PASSWORD TOKEN RESPONSE....", response);

      if(!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Reset Email Sent");
      setEmailSent(true);
      navigate('/resendMail')
    }
    catch(error) {
      console.log("RESET PASSWORD TOKEN Error", error);
      toast.error("Failed to send email for resetting password");
    }
    dispatch(setLoading(false));
  }
}

export function resetPassword(password, confirmPassword, token, navigate) {
  return async(dispatch) => {
    dispatch(setLoading(true));
    try{
      const response = await apiConnector("POST", RESETPASSWORD_API, {password, confirmPassword, token});

      console.log("RESET Password RESPONSE ... ", response);


      if(!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password has been reset successfully");
      navigate('/')
    }
    catch(error) {
      console.log("RESET PASSWORD TOKEN Error", error);
      toast.error("Unable to reset password");
    }
    dispatch(setLoading(false));
  }
}

export function googleLogin(email, accessToken, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in with Google...");
    dispatch(setLoading(true));
    try {
      // Replace with your actual backend endpoint for Google login
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        auth0AccessToken: accessToken, // Send Auth0 token to backend
        mode: "googleLogin", // Indicate Google login
      });

      console.log("GOOGLE LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Google Login Successful");
      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard"); // Redirect to dashboard after successful login

    } catch (error) {
      console.log("GOOGLE LOGIN API ERROR............", error);
      toast.error(error.response?.data?.message || "Google Login Failed");
      // If login fails, you might want to redirect to signup or offer a retry
      // For now, redirect to login page
      navigate("/login"); 
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function googleSignupFinalize(googleUserData, accessToken, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Finalizing Google signup...");
    dispatch(setLoading(true));
    try {
      // Replace with your actual backend endpoint for Google signup finalization
      // This endpoint should take Google-provided data and any additional signupData
      // to create a full user profile in your DB.
      const response = await apiConnector("POST", SIGNUP_API, {
        ...googleUserData, // email, firstName, lastName, picture, auth0Id
        accountType: googleUserData.accountType || 'Student', // Ensure accountType is set
        auth0AccessToken: accessToken, // Send Auth0 token to backend for verification
        mode: "googleSignup", // Indicate Google signup
      });

      console.log("GOOGLE SIGNUP FINALIZE API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Google Signup Successful! Please verify your email with OTP.");
      // After signup, the backend might send an OTP, so redirect to OTP verification page
      // Or if the user is directly logged in, set token and user.
      navigate("/verify-email"); // Assuming this is your OTP page
      // You might pass email to pre-fill the OTP page if needed: navigate("/verify-email", { state: { email: googleUserData.email } });

    } catch (error) {
      console.log("GOOGLE SIGNUP FINALIZE API ERROR............", error);
      toast.error(error.response?.data?.message || "Google Signup Failed");
      // If signup fails (e.g., email already exists), redirect to login
      navigate("/login"); 
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}
