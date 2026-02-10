import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SetupPassword from './pages/SetupPassword';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import ResendMail from './pages/ResendMail';
import ResetComplete from './pages/ResetComplete';
import VerifyEmail from './pages/VerifyEmail';
import UpdateProfile from './pages/UpdateProfile';
import DashBoard from './pages/Dashboard';
import Profile from '../src/components/core/Dashboard/MyProfile';
import Cart from './components/core/Dashboard/Cart';
import Settings from './components/core/Dashboard/Settings';
import EnrolledCourses from './components/core/Dashboard/EnrolledCourses';
import EditCourse from './components/core/Dashboard/EditCourse';
import AddCourse from './components/core/Dashboard/AddCourse';
import InstructorCourses from './components/core/Dashboard/MyCourses';
import Instructor from './components/core/Dashboard/InstructorDashboard/Instructor';
import SmartStudyCompanion from './components/core/Dashboard/SmartStudyCompanion';
import AIStudyAssistant from './components/core/Dashboard/AIStudyAssistant';
import TextToVideoSummarizer from './components/core/Dashboard/TextToVideoSummarizer';

// Admin Components
import AdminDashboardOverview from './components/core/Admin/AdminDashboardOverview';
import UserManagement from './components/core/Admin/UserManagement';
import InstructorManagement from './components/core/Admin/InstructorManagement';
import CourseManagement from './components/core/Admin/CourseManagement';
import RefundManagement from './components/core/Admin/RefundManagement';
import AnalyticsDashboard from './components/core/Admin/AnalyticsDashboard';
import AdminSettings from './components/core/Admin/AdminSettings';
import About from './pages/About';
import Catalog from './pages/Catalog';
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import CourseDetails from './pages/CourseDetails';
import ContactUsPage from './pages/Contact';
import Footer from './components/common/Footer';
import GoogleAuthHandler from './components/core/Auth/GoogleAuthHandler';
import Auth0Callback from './pages/Auth0Callback';

function App() {
  const location = useLocation();

  // Check if current route starts with "/dashboard"
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isviewCourse = location.pathname.startsWith("/view-course");

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth0/callback`
      }}
    >
      <GoogleAuthHandler />
      <div className="w-full min-h-screen bg-richblack-900 flex flex-col font-inter">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 w-full z-50 bg-richblack-900 border-b border-richblack-800">
          <Navbar />
        </div>

        {/* Add padding-top so content doesn’t hide behind fixed Navbar */}
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pt-[3.5rem]">
          <Routes>
            {/* Auth0 Callback */}
            <Route path="/auth0/callback" element={<Auth0Callback />} />
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/resendMail" element={<ResendMail />} />
            <Route path="/resetComplete" element={<ResetComplete />} />
            <Route path="/update-Password" element={<ChangePassword />} />
            <Route path="/updateProfile" element={<UpdateProfile />} />
            <Route path="/verifyEmail" element={<VerifyEmail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/catalog/:catalogName" element={<Catalog />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <div className="w-screen m-0">
                  <DashBoard />
                </div>
              }
            >
              <Route path="my-profile" element={<Profile />} />
              <Route path="cart" element={<Cart />} />
              <Route path="add-courses" element={<AddCourse />} />
              <Route path="settings" element={<Settings />} />
              <Route path="instructor-courses" element={<InstructorCourses />} />
              <Route path="instructor" element={<Instructor />} />
              <Route path="enrolled-courses" element={<EnrolledCourses />} />
              <Route path="smart-study" element={<SmartStudyCompanion />} />
              <Route path="ai-study-assistant" element={<AIStudyAssistant />} />
              <Route path="text-to-video-summarizer" element={<TextToVideoSummarizer />} />
              <Route path="edit-course/:courseId" element={<EditCourse />} />
            </Route>

            {/* Admin Routes - Uses same Dashboard component with role-based access */}
            <Route
              path="/admin"
              element={
                <div className="w-screen m-0">
                  <DashBoard />
                </div>
              }
            >
              <Route path="my-profile" element={<AdminDashboardOverview />} />
              <Route path="dashboard" element={<AdminDashboardOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="instructors" element={<InstructorManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="refunds" element={<RefundManagement />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Course View */}
            <Route
              path="/view-course/:courseId"
              element={
                <div className="w-screen m-0">
                  <ViewCourse />
                </div>
              }
            >
              <Route
                path="section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetails />}
              />
            </Route>
          </Routes>
        </main>

        {(!isDashboard || !isviewCourse) && <Footer />}

      </div>
    </Auth0Provider>
  );
}

export default App;
