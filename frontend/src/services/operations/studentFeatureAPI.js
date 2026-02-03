import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API
} = studentEndpoints;

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...");
  try {
    //load the script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      toast.error("RazorPay SDK failed to load");
      return;
    }

    //initiate the order
    console.log("🔍 FRONTEND: Sending payment request with courses:", courses);
    console.log("🔍 FRONTEND: User details:", userDetails);
    
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {
      courses,
      userDetails,
    });
    
    console.log("🔍 FRONTEND: Order response from payment service:", orderResponse);
    
    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }
    //options
    const options = {
      key: orderResponse.data.key,
      currency: orderResponse.data.message.currency,
      amount: `${orderResponse.data.message.amount}`,
      order_id: orderResponse.data.message.id,
      name: "StudyNotion",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName}`,
        email: userDetails.email,
      },
      handler: function (response) {
        console.log("🔍 FRONTEND: Razorpay response received:", response);
        verifyPayment(
          { ...response, courses, userDetails },
          token,
          navigate,
          dispatch
        );
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops, payment failed");
      console.log(response.error);
    });
  } catch (error) {
    console.log("PAYMENT API ERROR.....", error);
    toast.error(error.response.data.message);
  }
  toast.dismiss(toastId);
}


//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment....");
  console.log("🔍 FRONTEND: Verifying payment with data:", bodyData);
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      bodyData
      // { Authorization:`Bearer ${token}`,}
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("payment Successful, you are addded to the course");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR....", error);
    toast.error("Could not verify Payment");
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
