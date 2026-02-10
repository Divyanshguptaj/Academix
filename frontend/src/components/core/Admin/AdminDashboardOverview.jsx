import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUsers, FaChalkboardTeacher, FaBook, FaRupeeSign, FaSync, FaArrowUp, FaArrowDown } from "react-icons/fa"
import { format } from "date-fns"

export default function AdminDashboardOverview() {
  const { user } = useSelector((state) => state.profile)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true)
      const response = await apiConnector("GET", adminEndpoints.ADMIN_DASHBOARD_STATS)
      setStats(response.data.data)
      setError(null)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (user?.accountType !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4 bg-richblack-800 p-12 rounded-2xl border border-richblack-700 shadow-2xl">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-richblack-5">Access Denied</h1>
          <p className="text-richblack-300 max-w-md">You must be an admin to view this page. Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-richblack-600 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-yellow-50 rounded-full animate-spin"></div>
          </div>
          <p className="text-richblack-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-6 bg-richblack-800 p-12 rounded-2xl border border-richblack-700 shadow-2xl max-w-md">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-richblack-5 mb-2">Something went wrong</h1>
            <p className="text-richblack-300">{error}</p>
          </div>
          <button 
            onClick={fetchDashboardStats}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg hover:bg-yellow-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: "gray",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      details: [
        { label: "Students", value: stats?.studentCount || 0 },
        { label: "Instructors", value: stats?.instructorCount || 0 },
        { label: "Admin", value: stats?.instructorCount || 0 }
      ],
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: FaBook,
      color: "green",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-500/10 to-green-600/10",
      details: [
        { label: "Published", value: stats?.publishedCourses || 0 },
        { label: "Draft", value: stats?.draftCourses || 0 }
      ],
    },
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: FaRupeeSign,
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-500/10 to-yellow-600/10",
      details: [
        { label: "This Month", value: `₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}` },
        { label: "Pending", value: `₹${(stats?.pendingRevenue || 0).toLocaleString('en-IN')}` }
      ],
      trend: "+23%"
    },
    {
      title: "Pending Actions",
      value: stats?.pendingActions || 0,
      icon: FaChalkboardTeacher,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
      details: [
        { label: "Applications", value: stats?.pendingInstructorApplications || 0 },
        { label: "Approvals", value: stats?.pendingCourseApprovals || 0 },
        { label: "Refunds", value: stats?.pendingRefundRequests || 0 }
      ],
      urgent: true
    }
  ]

  const quickActions = [
    { name: "User Management", color: "blue", gradient: "from-blue-500 to-blue-600" },
    { name: "Manage Instructors", color: "green", gradient: "from-green-500 to-green-600" },
    { name: "Course Management", color: "purple", gradient: "from-purple-500 to-purple-600" },
    { name: "Refund Requests", color: "orange", gradient: "from-orange-500 to-orange-600" }
  ]

  return (
    <div className="min-h-screen bg-richblack-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-richblack-800 to-richblack-700 p-6 md:p-8 rounded-2xl border border-richblack-600 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChalkboardTeacher className="text-2xl text-richblack-900" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-richblack-200">Admin Dashboard</h1>
                <p className="text-gray-300 text-sm md:text-base">
                  Welcome back, <span className="text-gray-300 font-semibold">{user?.firstName} {user?.lastName}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Last updated: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
          
          <button 
            onClick={fetchDashboardStats}
            disabled={refreshing}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-richblack-900 px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div 
              key={index}
              className="group bg-richblack-800 rounded-2xl p-6 border border-richblack-700 hover:border-richblack-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-richblack-300 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-400 tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`text-2xl text-${card.color}-300`} />
                </div>
              </div>

              {/* Trend Indicator */}
              {/* {card.trend && (
                <div className="flex items-center gap-1.5 mb-4">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${card.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {card.trend.startsWith('+') ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                    <span className="text-xs font-semibold">{card.trend}</span>
                  </div>
                  <span className="text-xs text-richblack-400">vs last month</span>
                </div>
              )} */}

              {/* Divider */}
              <div className="border-t border-richblack-700 my-4"></div>

              {/* Details */}
              <div className="space-y-2">
                {card.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{detail.label}</span>
                    <span className="text-gray-200 font-semibold">{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* Urgent Badge */}
              {card.urgent && card.value > 0 && (
                <div className="mt-4 pt-4 border-t border-richblack-700">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-400 font-medium">Requires attention</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-richblack-800 rounded-2xl p-6 md:p-8 border border-richblack-700 shadow-xl">
          <h2 className="text-2xl font-bold text-richblack-200 mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                className={`group relative bg-gradient-to-br ${action.gradient} p-6 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <p className="text-white font-semibold text-center text-sm md:text-base">
                    {action.name}
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-tl-full transform translate-x-8 translate-y-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-300"></div>
              </button>
            ))}
          </div>
        </div> */}

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="bg-richblack-800 rounded-2xl p-6 md:p-8 border border-richblack-700 shadow-xl">
            <h2 className="text-2xl font-bold text-richblack-5 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              Recent Activity
            </h2>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-4 bg-richblack-700/50 hover:bg-richblack-700 rounded-xl border border-richblack-600/50 hover:border-richblack-500 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-richblack-5 font-semibold text-sm md:text-base">{activity.action}</p>
                      <p className="text-richblack-400 text-xs md:text-sm mt-0.5">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-xs md:text-sm text-richblack-400 whitespace-nowrap ml-4">
                    {format(new Date(activity.timestamp), "MMM dd, h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}