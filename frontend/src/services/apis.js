// API Gateway URL (Single entry point for all microservices)
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:4000/api/v1";

// AUTH ENDPOINTS (Routed through API Gateway to User Service)
export const endpoints = {
  SENDOTP_API: API_GATEWAY_URL + "/auth/sendotp",
  SIGNUP_API: API_GATEWAY_URL + "/auth/signup",
  LOGIN_API: API_GATEWAY_URL + "/auth/login",
  GOOGLE_AUTH_API: API_GATEWAY_URL + "/auth/google-auth",
  RESETPASSTOKEN_API: API_GATEWAY_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: API_GATEWAY_URL + "/auth/reset-password",
  SUBMIT_INSTRUCTOR_APPLICATION: API_GATEWAY_URL + "/auth/submit-instructor-application",
}

// PROFILE ENDPOINTS (Routed through API Gateway to User Service)
export const profileEndpoints = {
  GET_USER_DETAILS_API: API_GATEWAY_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: API_GATEWAY_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: API_GATEWAY_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS (Routed through API Gateway to Payment Service)
export const studentEndpoints = {
  COURSE_PAYMENT_API: API_GATEWAY_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: API_GATEWAY_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: API_GATEWAY_URL + "/payment/sendPaymentSuccessEmail",
  REFUND_API: API_GATEWAY_URL + "/payment/refund",
}

// COURSE ENDPOINTS (Routed through API Gateway to Course Service)
export const courseEndpoints = {
  GET_ALL_COURSE_API: API_GATEWAY_URL + "/course/showAllCoures",
  COURSE_DETAILS_API: API_GATEWAY_URL + "/course/getFullCourseDetails",
  EDIT_COURSE_API: API_GATEWAY_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: API_GATEWAY_URL + "/course/showAllCategories", 
  CREATE_COURSE_API: API_GATEWAY_URL + "/course/createCourse",
  CREATE_SECTION_API: API_GATEWAY_URL + "/course/createSection",
  CREATE_SUBSECTION_API: API_GATEWAY_URL + "/course/addSubSection",
  UPDATE_SECTION_API: API_GATEWAY_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: API_GATEWAY_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: API_GATEWAY_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: API_GATEWAY_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: API_GATEWAY_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: API_GATEWAY_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: API_GATEWAY_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: API_GATEWAY_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: API_GATEWAY_URL + "/course/createRating",
}

// RATINGS AND REVIEWS (Routed through API Gateway to Course Service)
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: API_GATEWAY_URL + "/course/getReviews",
}

// CATAGORIES API (Routed through API Gateway to Course Service)
export const categories = {
  CATEGORIES_API: API_GATEWAY_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA (Routed through API Gateway to Course Service)
export const catalogData = {
  CATALOGPAGEDATA_API: API_GATEWAY_URL + "/course/getCategoryPageDetails",
}

// CONTACT-US API (Handled directly by API Gateway)
export const contactusEndpoint = {
  CONTACT_US_API: API_GATEWAY_URL + "/contact",
}

// SETTINGS PAGE API (Routed through API Gateway to User Service)
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: API_GATEWAY_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: API_GATEWAY_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: API_GATEWAY_URL + "/auth/changepassword",
  DELETE_PROFILE_API: API_GATEWAY_URL + "/profile/deleteAccount",
}

// SMART STUDY API (Routed through API Gateway to AI Service)
export const smartStudyEndpoints = {
  GENERATE_SUMMARY_API: API_GATEWAY_URL + "/smart-study/generateSummary",
  CHAT_WITH_DOCUMENT_API: API_GATEWAY_URL + "/smart-study/chatWithDocument",
  ASK_DOUBT_API: API_GATEWAY_URL + "/smart-study/askDoubt",

  TEXT_TO_VIDEO_SUMMARIZER_API: API_GATEWAY_URL + "/smart-study/textToVideoSummarizer",
  GENERATE_JSON2_VIDEO_API: API_GATEWAY_URL + "/smart-study/generateJson2Video",
  CHECK_JSON2_STATUS_API: API_GATEWAY_URL + "/smart-study/checkJson2Status",
}

// ADMIN API ENDPOINTS (Routed through API Gateway to User Service)
export const adminEndpoints = {
  ADMIN_DASHBOARD_STATS: API_GATEWAY_URL + "/admin/dashboard-stats",
  GET_ALL_USERS: API_GATEWAY_URL + "/admin/users",
  UPDATE_USER_STATUS: API_GATEWAY_URL + "/admin/users/:id/status",
  GET_USER_DETAILS: API_GATEWAY_URL + "/admin/users/:id/details",
  
  GET_ALL_INSTRUCTORS: API_GATEWAY_URL + "/admin/instructors",
  APPROVE_INSTRUCTOR: API_GATEWAY_URL + "/admin/instructors/:id/approve",
  REVOKE_INSTRUCTOR: API_GATEWAY_URL + "/admin/instructors/:id/revoke",
  GET_INSTRUCTOR_APPLICATIONS: API_GATEWAY_URL + "/admin/instructor-applications",
  
  GET_ALL_COURSES: API_GATEWAY_URL + "/admin/courses",
  APPROVE_COURSE: API_GATEWAY_URL + "/admin/courses/:id/approve",
  REJECT_COURSE: API_GATEWAY_URL + "/admin/courses/:id/reject",
  GET_COURSE_ANALYTICS: API_GATEWAY_URL + "/admin/courses/:id/analytics",
  
  GET_REFUND_REQUESTS: API_GATEWAY_URL + "/admin/refunds",
  PROCESS_REFUND: API_GATEWAY_URL + "/admin/refunds/:id/process",
  REJECT_REFUND: API_GATEWAY_URL + "/admin/refunds/:id/reject",
  GET_REFUND_ANALYTICS: API_GATEWAY_URL + "/admin/refunds/analytics",
  
  GET_ANALYTICS: API_GATEWAY_URL + "/admin/analytics",
  EXPORT_DATA: API_GATEWAY_URL + "/admin/export",
}
