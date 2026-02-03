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
    console.log("� FRONTEND: Sending payment request with courses:", courses);
    console.log("📝 FRONTEND: User details:", userDetails);
    
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {
      courses,
      userDetails,
    });
    
    console.log("📝 FRONTEND: Order response from payment service:", orderResponse);
    
    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    // Extract order details from response
    const orderId = orderResponse.data.orderId;
    const key = orderResponse.data.key;
    const amount = orderResponse.data.amount;

    console.log("📝 FRONTEND: Order ID:", orderId);
    console.log("📝 FRONTEND: Amount:", amount);
    
    //options
    const options = {
      key: key,
      currency: "INR",
      amount: amount,
      order_id: orderId,
      name: "StudyNotion",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,
      prefill: {
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
      },
      handler: function (response) {
        console.log("✅ FRONTEND: Razorpay response received:", response);
        console.log("✅ FRONTEND: Order ID:", response.razorpay_order_id);
        console.log("✅ FRONTEND: Payment ID:", response.razorpay_payment_id);
        console.log("✅ FRONTEND: Signature:", response.razorpay_signature);
        
        // Pass all required fields to verification
        verifyPayment(
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courses,
            userDetails,
          },
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
      console.error("❌ FRONTEND: Payment failed:", response.error);
    });
  } catch (error) {
    console.error("❌ PAYMENT API ERROR:", error);
    toast.error(error.response?.data?.message || "Payment initiation failed");
  }
  toast.dismiss(toastId);
}


//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment....");
  console.log("� FRONTEND: Verifying payment with data:");
  console.log("  - Order ID:", bodyData.razorpay_order_id);
  console.log("  - Payment ID:", bodyData.razorpay_payment_id);
  console.log("  - Signature:", bodyData.razorpay_signature?.substring(0, 10) + "...");
  
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      {
        razorpay_order_id: bodyData.razorpay_order_id,
        razorpay_payment_id: bodyData.razorpay_payment_id,
        razorpay_signature: bodyData.razorpay_signature,
        courses: bodyData.courses,
        userDetails: bodyData.userDetails,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    console.log("✅ FRONTEND: Payment verified successfully");
    toast.success("Payment successful! You are enrolled in the course");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.error("❌ PAYMENT VERIFY ERROR:", error);
    toast.error(error.response?.data?.message || "Could not verify payment");
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
