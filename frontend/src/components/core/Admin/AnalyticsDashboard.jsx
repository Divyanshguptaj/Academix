import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import {
  FaUsers, FaBook, FaRupeeSign, FaUserGraduate, FaUserTie,
  FaCheckCircle, FaClock, FaTimesCircle, FaSync, FaChartBar
} from "react-icons/fa"
import { format } from "date-fns"

export default function AnalyticsDashboard() {
  const { user } = useSelector((state) => state.profile)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await apiConnector("GET", adminEndpoints.ADMIN_DASHBOARD_STATS)
      setStats(res.data.data)
    } catch {
      toast.error("Failed to load analytics")
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

  const totalCourses = stats?.totalCourses ?? 0
  const publishedCourses = stats?.publishedCourses ?? 0
  const draftCourses = stats?.draftCourses ?? 0
  const pendingCourseApprovals = stats?.pendingCourseApprovals ?? 0
  const publishRate = totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0
  const totalUsers = stats?.totalUsers ?? 0
  const studentCount = stats?.studentCount ?? 0
  const instructorCount = stats?.instructorCount ?? 0
  const adminCount = stats?.adminCount ?? 0
  const totalRevenue = stats?.totalRevenue ?? 0
  const monthlyRevenue = stats?.monthlyRevenue ?? 0
  const pendingRevenue = stats?.pendingRevenue ?? 0

  const metricCards = [
    {
      title: "Platform Users",
      value: totalUsers,
      icon: FaUsers,
      color: "blue",
      rows: [
        { label: "Students", value: studentCount, pct: totalUsers > 0 ? Math.round((studentCount / totalUsers) * 100) : 0, color: "bg-blue-400" },
        { label: "Instructors", value: instructorCount, pct: totalUsers > 0 ? Math.round((instructorCount / totalUsers) * 100) : 0, color: "bg-purple-400" },
        { label: "Admins", value: adminCount, pct: totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0, color: "bg-yellow-400" },
      ],
    },
    {
      title: "Courses",
      value: totalCourses,
      icon: FaBook,
      color: "green",
      rows: [
        { label: "Published", value: publishedCourses, pct: totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0, color: "bg-green-400" },
        { label: "Draft", value: draftCourses, pct: totalCourses > 0 ? Math.round((draftCourses / totalCourses) * 100) : 0, color: "bg-richblack-400" },
        { label: "Pending Review", value: pendingCourseApprovals, pct: totalCourses > 0 ? Math.round((pendingCourseApprovals / totalCourses) * 100) : 0, color: "bg-orange-400" },
      ],
    },
  ]

  const revenueCards = [
    { label: "Total Revenue", value: totalRevenue, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Monthly Revenue", value: monthlyRevenue, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Pending Revenue", value: pendingRevenue, color: "text-orange-400", bg: "bg-orange-500/10" },
  ]

  const pendingItems = [
    { label: "Instructor Applications", value: stats?.pendingInstructorApplications ?? 0, icon: FaUserTie, color: "text-orange-400" },
    { label: "Course Approvals", value: stats?.pendingCourseApprovals ?? 0, icon: FaClock, color: "text-yellow-400" },
    { label: "Refund Requests", value: stats?.pendingRefundRequests ?? 0, icon: FaRupeeSign, color: "text-red-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Analytics & Reports</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Platform overview — live data from all services</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-richblack-500">
            Last updated: {format(new Date(), "MMM dd, h:mm a")}
          </span>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div>
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaRupeeSign /> Revenue Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {revenueCards.map((card) => (
            <div key={card.label} className={`${card.bg} border border-richblack-700 rounded-xl p-5`}>
              <p className="text-xs text-richblack-400 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                ₹{card.value.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* User & Course Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaChartBar /> Platform Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metricCards.map((card) => {
            const iconColorMap = { blue: "text-blue-400 bg-blue-500/10", green: "text-green-400 bg-green-500/10" }
            const [ic, bg] = (iconColorMap[card.color] || "text-richblack-400 bg-richblack-700").split(" bg-")
            return (
              <div key={card.title} className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-richblack-5">{card.title}</h3>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[card.color]?.split(" ")[1] || "bg-richblack-700"}`}>
                    <card.icon className={`text-base ${ic}`} />
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
                          className={`h-full ${row.color} rounded-full transition-all duration-500`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Actions */}
      <div>
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaClock /> Pending Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pendingItems.map((item) => (
            <div key={item.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-richblack-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className={`text-base ${item.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-richblack-400 mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Ratios */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-richblack-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <FaCheckCircle /> Key Platform Ratios
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
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
              label: "Monthly Growth",
              value: totalRevenue > 0 ? `${Math.round((monthlyRevenue / totalRevenue) * 100)}%` : "0%",
              sub: "of total revenue this month",
              color: "text-blue-400",
            },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-richblack-700/50 rounded-xl">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs font-medium text-richblack-300 mt-1">{item.label}</p>
              <p className="text-xs text-richblack-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note about detailed analytics */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-richblack-400">
        <FaChartBar className="text-blue-400 mt-0.5 flex-shrink-0" />
        <span>
          Detailed time-series charts (revenue trends, enrollment growth, user acquisition) are coming soon.
          This overview uses real-time data from all platform services.
        </span>
      </div>
    </div>
  )
}
