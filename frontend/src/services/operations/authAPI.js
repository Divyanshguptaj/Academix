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
  GOOGLE_AUTH_API,
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
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // Call backend to invalidate token
      const response = await apiConnector("POST", "/api/v1/auth/logout", {});

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Clear Redux state
      dispatch(setToken(null))
      dispatch(setUser(null))

      // Clear local storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      toast.success("Logged Out Successfully");
      navigate("/")
    } catch (error) {
      console.error("Logout Error:", error);
      // Still clear local state even if backend call fails
      dispatch(setToken(null))
      dispatch(setUser(null))
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      toast.success("Logged Out (Local)");
      navigate("/")
    } finally {
      dispatch(setLoading(false));
    }
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

// Helper function that returns a Promise for error handling in Auth0Callback
export async function checkGoogleUserAndLogin(userData) {
  try {
    const response = await apiConnector("POST", GOOGLE_AUTH_API, {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      picture: userData.picture,
      auth0Id: userData.auth0Id,
      mode: "login",
    });

    console.log("GOOGLE LOGIN RESPONSE:", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return { success: true, user: response.data.user, token: response.data.token };
  } catch (error) {
    console.error("Google login error:", error);
    throw error; // Throw so caller can catch and handle
  }
}

export function googleLogin(userData) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in...");
    dispatch(setLoading(true));
    try {
      const result = await checkGoogleUserAndLogin(userData);

      toast.success("Welcome back User!");
      dispatch(setToken(result.token));
      
      const userImage = result.user?.image
        ? result.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${result.user.firstName} ${result.user.lastName}`;
      
      dispatch(setUser({ ...result.user, image: userImage }));
      localStorage.setItem("token", JSON.stringify(result.token));
      localStorage.setItem("user", JSON.stringify(result.user));
      
      setTimeout(() => {
        window.location.href = "/dashboard/my-profile";
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function googleSignupFinalize(userData, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating account...");
    dispatch(setLoading(true));
    try {
      // Call backend Google Auth API
      const response = await apiConnector("POST", GOOGLE_AUTH_API, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        picture: userData.picture,
        auth0Id: userData.auth0Id,
        accountType: userData.accountType || 'Student',
        mode: "signup",
      });

      // console.log("GOOGLE SIGNUP RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success(response.data.message || "Signup successful!");
      dispatch(setToken(response.data.token));
      
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
      
      dispatch(setUser({ ...response.data.user, image: userImage }));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Clear session storage
      sessionStorage.removeItem('googleUserData');
      
      setTimeout(() => {
        navigate("/dashboard/my-profile");
      }, 500);
    } catch (error) {
      console.error("GOOGLE SIGNUP ERROR:", error);
      setTimeout(() => {
        navigate("/signup");
      }, 500);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}
