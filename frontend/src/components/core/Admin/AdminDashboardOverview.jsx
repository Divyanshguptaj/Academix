import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import {
  FaUsers, FaBook, FaRupeeSign, FaSync,
  FaUserTie, FaShieldAlt, FaClock, FaCheckCircle,
  FaArrowRight, FaExclamationTriangle, FaChartBar, FaUserGraduate,
} from "react-icons/fa"
import { format } from "date-fns"

export default function AdminDashboardOverview() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchDashboardStats()
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true)
      const response = await apiConnector("GET", adminEndpoints.ADMIN_DASHBOARD_STATS)
      console.log('[AdminDashboard] raw response:', response.data)
      setStats(response.data.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('[AdminDashboard] fetch error:', err.response?.data || err.message)
      toast.error("Failed to load dashboard stats")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-richblack-600 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Derived values
  const totalUsers = stats?.totalUsers ?? 0
  const studentCount = stats?.studentCount ?? 0
  const instructorCount = stats?.instructorCount ?? 0
  const adminCount = stats?.adminCount ?? 0
  const totalCourses = stats?.totalCourses ?? 0
  const publishedCourses = stats?.publishedCourses ?? 0
  const draftCourses = stats?.draftCourses ?? 0
  const pendingCourseApprovals = stats?.pendingCourseApprovals ?? 0
  const totalRevenue = stats?.totalRevenue ?? 0
  const monthlyRevenue = stats?.monthlyRevenue ?? 0
  const pendingRevenue = stats?.pendingRevenue ?? 0
  const publishRate = totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: FaUsers,
      details: [
        { label: "Students", value: studentCount, color: "text-blue-400" },
        { label: "Instructors", value: instructorCount, color: "text-purple-400" },
        { label: "Admins", value: adminCount, color: "text-yellow-400" },
      ],
      accent: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Total Courses",
      value: totalCourses,
      icon: FaBook,
      details: [
        { label: "Published", value: publishedCourses, color: "text-green-400" },
        { label: "Draft", value: draftCourses, color: "text-richblack-300" },
        { label: "Pending", value: pendingCourseApprovals, color: "text-orange-400" },
      ],
      accent: "from-green-500/20 to-green-600/10",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: FaRupeeSign,
      details: [
        { label: "This Month", value: `₹${monthlyRevenue.toLocaleString("en-IN")}`, color: "text-yellow-400" },
        { label: "Pending", value: `₹${pendingRevenue.toLocaleString("en-IN")}`, color: "text-orange-400" },
      ],
      accent: "from-yellow-500/20 to-yellow-600/10",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Pending Actions",
      value: stats?.pendingActions ?? 0,
      icon: FaClock,
      urgent: (stats?.pendingActions ?? 0) > 0,
      details: [
        { label: "Applications", value: stats?.pendingInstructorApplications ?? 0, color: "text-orange-400" },
        { label: "Approvals", value: pendingCourseApprovals, color: "text-yellow-400" },
        { label: "Refunds", value: stats?.pendingRefundRequests ?? 0, color: "text-red-400" },
      ],
      accent: "from-orange-500/20 to-orange-600/10",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
  ]

  const quickActions = [
    { label: "User Management", to: "/admin/users", icon: FaUsers, color: "blue", desc: `${totalUsers} users` },
    { label: "Instructors", to: "/admin/instructors", icon: FaUserTie, color: "purple", desc: `${stats?.pendingInstructorApplications ?? 0} pending` },
    { label: "Courses", to: "/admin/courses", icon: FaBook, color: "green", desc: `${totalCourses} total` },
    { label: "Refunds", to: "/admin/refunds", icon: FaRupeeSign, color: "orange", desc: `${stats?.pendingRefundRequests ?? 0} pending` },
  ]

  const actionColorMap = {
    blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-400/40",
    purple: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 hover:border-purple-400/40",
    green: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-400/40",
    orange: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 hover:border-orange-400/40",
  }
  const actionIconColor = {
    blue: "text-blue-400", purple: "text-purple-400", green: "text-green-400", orange: "text-orange-400",
  }

  const breakdownCards = [
    {
      title: "Users",
      value: totalUsers,
      icon: FaUsers,
      iconClass: "text-blue-400",
      iconBg: "bg-blue-500/10",
      rows: [
        { label: "Students", value: studentCount, pct: totalUsers > 0 ? Math.round((studentCount / totalUsers) * 100) : 0, bar: "bg-blue-400" },
        { label: "Instructors", value: instructorCount, pct: totalUsers > 0 ? Math.round((instructorCount / totalUsers) * 100) : 0, bar: "bg-purple-400" },
        { label: "Admins", value: adminCount, pct: totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0, bar: "bg-yellow-400" },
      ],
    },
    {
      title: "Courses",
      value: totalCourses,
      icon: FaBook,
      iconClass: "text-green-400",
      iconBg: "bg-green-500/10",
      rows: [
        { label: "Published", value: publishedCourses, pct: totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0, bar: "bg-green-400" },
        { label: "Draft", value: draftCourses, pct: totalCourses > 0 ? Math.round((draftCourses / totalCourses) * 100) : 0, bar: "bg-richblack-400" },
        { label: "Pending Review", value: pendingCourseApprovals, pct: totalCourses > 0 ? Math.round((pendingCourseApprovals / totalCourses) * 100) : 0, bar: "bg-orange-400" },
      ],
    },
  ]

  const ratios = [
    {
      label: "Course Publish Rate",
      value: `${publishRate}%`,
      sub: `${publishedCourses} of ${totalCourses} courses`,
      color: "text-green-400",
    },
    {
      label: "Instructor Ratio",
      value: totalUsers > 0 ? `${Math.round((instructorCount / totalUsers) * 100)}%` : "0%",
      sub: `${instructorCount} instructors`,
      color: "text-purple-400",
    },
    {
      label: "Avg Revenue / Course",
      value: publishedCourses > 0 ? `₹${Math.round(totalRevenue / publishedCourses).toLocaleString("en-IN")}` : "₹0",
      sub: "per published course",
      color: "text-yellow-400",
    },
    {
      label: "Monthly Share",
      value: totalRevenue > 0 ? `${Math.round((monthlyRevenue / totalRevenue) * 100)}%` : "0%",
      sub: "of total revenue this month",
      color: "text-blue-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Admin Dashboard</h1>
          <p className="text-sm text-richblack-400 mt-0.5">
            Welcome back,{" "}
            <span className="text-yellow-400 font-medium">{user?.firstName} {user?.lastName}</span>
            {" · "}
            {format(new Date(), "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-richblack-500">Updated {format(lastUpdated, "h:mm a")}</span>
          )}
          <button
            onClick={fetchDashboardStats}
            disabled={refreshing}
            className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.accent} border border-richblack-700 rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-richblack-400 uppercase tracking-wide">{card.title}</p>
                <p className="text-3xl font-bold text-richblack-5 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`text-xl ${card.iconColor}`} />
              </div>
            </div>
            {card.urgent && (
              <div className="flex items-center gap-2 mb-3 text-orange-400 text-xs font-medium">
                <FaExclamationTriangle />
                <span>Requires attention</span>
              </div>
            )}
            <div className="border-t border-richblack-700/60 pt-3 space-y-1.5">
              {card.details.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-xs">
                  <span className="text-richblack-400">{d.label}</span>
                  <span className={`font-semibold ${d.color || "text-richblack-200"}`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-richblack-200 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left group ${actionColorMap[action.color]}`}
            >
              <div className="w-9 h-9 rounded-lg bg-richblack-800 flex items-center justify-center flex-shrink-0">
                <action.icon className={`${actionIconColor[action.color]} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-richblack-100 truncate">{action.label}</p>
                <p className="text-xs text-richblack-400 truncate">{action.desc}</p>
              </div>
              <FaArrowRight className={`text-xs ${actionIconColor[action.color]} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Overview */}
      <div>
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaRupeeSign /> Revenue Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: totalRevenue, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Monthly Revenue", value: monthlyRevenue, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Pending Revenue", value: pendingRevenue, color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} border border-richblack-700 rounded-xl p-5`}>
              <p className="text-xs text-richblack-400 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>₹{card.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaChartBar /> Platform Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {breakdownCards.map((card) => (
            <div key={card.title} className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-richblack-5">{card.title}</h3>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <card.icon className={`text-base ${card.iconClass}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-richblack-5 mb-4">{card.value}</p>
              <div className="space-y-3">
                {card.rows.map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-richblack-400">{row.label}</span>
                      <span className="text-richblack-200 font-medium">{row.value} ({row.pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-richblack-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Platform Ratios */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <FaCheckCircle /> Key Platform Ratios
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ratios.map((item) => (
            <div key={item.label} className="text-center p-3 bg-richblack-700/50 rounded-xl">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs font-medium text-richblack-300 mt-1">{item.label}</p>
              <p className="text-xs text-richblack-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Alert */}
      {(stats?.pendingActions ?? 0) > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaExclamationTriangle className="text-orange-400" />
            <h2 className="text-base font-semibold text-orange-300">
              {stats.pendingActions} item{stats.pendingActions !== 1 ? "s" : ""} need your attention
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(stats?.pendingInstructorApplications ?? 0) > 0 && (
              <button
                onClick={() => navigate("/admin/instructors")}
                className="flex items-center justify-between bg-richblack-800 hover:bg-richblack-700 border border-richblack-700 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaUserTie className="text-orange-400 text-sm" />
                  <span className="text-sm text-richblack-200">Instructor Applications</span>
                </div>
                <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingInstructorApplications}
                </span>
              </button>
            )}
            {(stats?.pendingCourseApprovals ?? 0) > 0 && (
              <button
                onClick={() => navigate("/admin/courses")}
                className="flex items-center justify-between bg-richblack-800 hover:bg-richblack-700 border border-richblack-700 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaBook className="text-yellow-400 text-sm" />
                  <span className="text-sm text-richblack-200">Course Approvals</span>
                </div>
                <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingCourseApprovals}
                </span>
              </button>
            )}
            {(stats?.pendingRefundRequests ?? 0) > 0 && (
              <button
                onClick={() => navigate("/admin/refunds")}
                className="flex items-center justify-between bg-richblack-800 hover:bg-richblack-700 border border-richblack-700 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaRupeeSign className="text-red-400 text-sm" />
                  <span className="text-sm text-richblack-200">Refund Requests</span>
                </div>
                <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingRefundRequests}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* All clear */}
      {(stats?.pendingActions ?? 0) === 0 && stats && (
        <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
          <p className="text-sm text-green-300">All caught up! No pending actions right now.</p>
        </div>
      )}
    </div>
  )
}
