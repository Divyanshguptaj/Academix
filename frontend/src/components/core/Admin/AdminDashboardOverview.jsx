import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUsers, FaChalkboardTeacher, FaBook, FaRupeeSign } from "react-icons/fa"
import { format } from "date-fns"

export default function AdminDashboardOverview() {
  const { user } = useSelector((state) => state.profile)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.ADMIN_DASHBOARD_STATS)
      setStats(response.data.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  if (user?.accountType !== "Admin") {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-richblack-200">Access Denied</h1>
        <p className="text-richblack-400 mt-2">You must be an admin to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-richblack-200">Error</h1>
        <p className="text-richblack-400 mt-2">{error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-richblack-50">Admin Dashboard</h1>
          <p className="text-richblack-300 mt-1">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-richblack-400 mt-1">
            Last updated: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchDashboardStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Users</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <FaUsers className="text-4xl text-blue-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">Students: {stats?.studentCount || 0}</span>
            <span className="text-richblack-400">Instructors: {stats?.instructorCount || 0}</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Courses</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {stats?.totalCourses || 0}
              </p>
            </div>
            <FaBook className="text-4xl text-green-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">Published: {stats?.publishedCourses || 0}</span>
            <span className="text-richblack-400">Draft: {stats?.draftCourses || 0}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Revenue</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                ₹{stats?.totalRevenue || 0}
              </p>
            </div>
            <FaRupeeSign className="text-4xl text-yellow-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">This Month: ₹{stats?.monthlyRevenue || 0}</span>
            <span className="text-richblack-400">Pending: ₹{stats?.pendingRevenue || 0}</span>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Pending Actions</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {stats?.pendingActions || 0}
              </p>
            </div>
            <FaChalkboardTeacher className="text-4xl text-orange-400" />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <span className="text-richblack-400">Instructor Applications: {stats?.pendingInstructorApplications || 0}</span>
            <span className="text-richblack-400">Course Approvals: {stats?.pendingCourseApprovals || 0}</span>
            <span className="text-richblack-400">Refund Requests: {stats?.pendingRefundRequests || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <h2 className="text-xl font-semibold text-richblack-50 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700 transition-colors">
            View User Management
          </button>
          <button className="bg-green-600 text-white p-4 rounded-md hover:bg-green-700 transition-colors">
            Manage Instructors
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-md hover:bg-purple-700 transition-colors">
            Course Management
          </button>
          <button className="bg-orange-600 text-white p-4 rounded-md hover:bg-orange-700 transition-colors">
            Refund Requests
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h2 className="text-xl font-semibold text-richblack-50 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-richblack-600 rounded-md">
                <div>
                  <p className="text-richblack-50 font-medium">{activity.action}</p>
                  <p className="text-sm text-richblack-300">{activity.description}</p>
                </div>
                <span className="text-sm text-richblack-400">
                  {format(new Date(activity.timestamp), "MMM dd, h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}