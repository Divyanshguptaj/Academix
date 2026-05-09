import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import {
  FaUsers, FaBook, FaRupeeSign, FaClock,
  FaUserTie, FaArrowRight, FaExclamationTriangle, FaCheckCircle,
} from "react-icons/fa"
import { format } from "date-fns"
import RefreshButton from "../../common/RefreshButton"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-richblack-600 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    </div>
  )
}

function BreakdownCard({ title, total, rows }) {
  return (
    <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-richblack-300 uppercase tracking-wide">{title}</h3>
        <span className="text-2xl font-bold text-richblack-5">{total.toLocaleString()}</span>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-richblack-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${row.bar}`} />
                {row.label}
              </span>
              <span className="text-richblack-200 font-semibold">
                {row.value.toLocaleString()} <span className="text-richblack-500 font-normal">({row.pct}%)</span>
              </span>
            </div>
            <div className="h-2 bg-richblack-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${row.bar} rounded-full transition-all duration-700`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PendingButton({ icon: Icon, label, count, to, navigate, colorClass }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center justify-between bg-richblack-800 hover:bg-richblack-700 border border-richblack-700 px-4 py-3 rounded-lg transition-colors w-full"
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`${colorClass} text-sm`} />
        <span className="text-sm text-richblack-200">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-richblack-700 ${colorClass}`}>
        {count}
      </span>
    </button>
  )
}

export default function AdminDashboardOverview() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await apiConnector("GET", adminEndpoints.ADMIN_DASHBOARD_STATS)
      setStats(res.data.data)
      setLastUpdated(new Date())
    } catch {
      toast.error("Failed to load dashboard stats")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const s = stats || {}
  const totalUsers = s.totalUsers ?? 0
  const totalCourses = s.totalCourses ?? 0
  const totalRevenue = s.totalRevenue ?? 0
  const pendingActions = s.pendingActions ?? 0
  const publishedCourses = s.publishedCourses ?? 0
  const draftCourses = s.draftCourses ?? 0
  const studentCount = s.studentCount ?? 0
  const instructorCount = s.instructorCount ?? 0
  const adminCount = s.adminCount ?? 0

  const kpiCards = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      sub: `${studentCount.toLocaleString()} students · ${instructorCount.toLocaleString()} instructors`,
      icon: FaUsers,
      gradient: "from-blue-500/15 to-transparent",
      border: "border-blue-500/25",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Total Courses",
      value: totalCourses.toLocaleString(),
      sub: `${publishedCourses.toLocaleString()} published · ${draftCourses.toLocaleString()} draft`,
      icon: FaBook,
      gradient: "from-green-500/15 to-transparent",
      border: "border-green-500/25",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      sub: `₹${(s.monthlyRevenue ?? 0).toLocaleString("en-IN")} this month`,
      icon: FaRupeeSign,
      gradient: "from-yellow-500/15 to-transparent",
      border: "border-yellow-500/25",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      label: "Pending Actions",
      value: pendingActions.toLocaleString(),
      sub: `${s.pendingInstructorApplications ?? 0} applications · ${s.pendingRefundRequests ?? 0} refunds`,
      icon: FaClock,
      gradient: pendingActions > 0 ? "from-orange-500/15 to-transparent" : "from-richblack-700/50 to-transparent",
      border: pendingActions > 0 ? "border-orange-500/25" : "border-richblack-700",
      iconBg: pendingActions > 0 ? "bg-orange-500/20" : "bg-richblack-700",
      iconColor: pendingActions > 0 ? "text-orange-400" : "text-richblack-400",
    },
  ]

  const quickActions = [
    { label: "Users", desc: `${totalUsers.toLocaleString()} total`, to: "/admin/users", icon: FaUsers, color: "blue" },
    { label: "Instructors", desc: `${s.pendingInstructorApplications ?? 0} pending`, to: "/admin/instructors", icon: FaUserTie, color: "purple" },
    { label: "Courses", desc: `${totalCourses.toLocaleString()} total`, to: "/admin/courses", icon: FaBook, color: "green" },
    { label: "Refunds", desc: `${s.pendingRefundRequests ?? 0} pending`, to: "/admin/refunds", icon: FaRupeeSign, color: "orange" },
  ]

  const navColor = {
    blue: { card: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-400/40", icon: "text-blue-400" },
    purple: { card: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 hover:border-purple-400/40", icon: "text-purple-400" },
    green: { card: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-400/40", icon: "text-green-400" },
    orange: { card: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 hover:border-orange-400/40", icon: "text-orange-400" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">
            Good {getGreeting()}, {user?.firstName}
          </h1>
          <p className="text-sm text-richblack-400 mt-0.5">
            {format(new Date(), "EEEE, MMMM d yyyy")}
            {lastUpdated && (
              <span className="text-richblack-600"> · Updated {format(lastUpdated, "h:mm a")}</span>
            )}
          </p>
        </div>
        <RefreshButton onClick={fetchStats} loading={loading || refreshing} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-bold text-richblack-5 mt-1.5 mb-1">{card.value}</p>
                <p className="text-xs text-richblack-500 truncate">{card.sub}</p>
              </div>
              <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`${card.iconColor} text-lg`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard
          title="Users"
          total={totalUsers}
          rows={[
            { label: "Students", value: studentCount, pct: totalUsers > 0 ? Math.round((studentCount / totalUsers) * 100) : 0, bar: "bg-blue-400" },
            { label: "Instructors", value: instructorCount, pct: totalUsers > 0 ? Math.round((instructorCount / totalUsers) * 100) : 0, bar: "bg-purple-400" },
            { label: "Admins", value: adminCount, pct: totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0, bar: "bg-yellow-400" },
          ]}
        />
        <BreakdownCard
          title="Courses"
          total={totalCourses}
          rows={[
            { label: "Published", value: publishedCourses, pct: totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0, bar: "bg-green-400" },
            { label: "Draft", value: draftCourses, pct: totalCourses > 0 ? Math.round((draftCourses / totalCourses) * 100) : 0, bar: "bg-richblack-400" },
          ]}
        />
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const c = navColor[action.color]
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left group ${c.card}`}
              >
                <div className="w-9 h-9 rounded-lg bg-richblack-800 flex items-center justify-center flex-shrink-0">
                  <action.icon className={`${c.icon} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-richblack-100">{action.label}</p>
                  <p className="text-xs text-richblack-400 truncate">{action.desc}</p>
                </div>
                <FaArrowRight className={`text-xs ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Pending Alert / All Clear */}
      {pendingActions > 0 ? (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaExclamationTriangle className="text-orange-400" />
            <p className="text-sm font-semibold text-orange-300">
              {pendingActions} item{pendingActions !== 1 ? "s" : ""} need{pendingActions === 1 ? "s" : ""} your attention
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(s.pendingInstructorApplications ?? 0) > 0 && (
              <PendingButton
                icon={FaUserTie}
                label="Instructor Applications"
                count={s.pendingInstructorApplications}
                to="/admin/instructors"
                navigate={navigate}
                colorClass="text-orange-400"
              />
            )}
            {(s.pendingRefundRequests ?? 0) > 0 && (
              <PendingButton
                icon={FaRupeeSign}
                label="Refund Requests"
                count={s.pendingRefundRequests}
                to="/admin/refunds"
                navigate={navigate}
                colorClass="text-red-400"
              />
            )}
          </div>
        </div>
      ) : stats && (
        <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <FaCheckCircle className="text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">All caught up — no pending actions.</p>
        </div>
      )}
    </div>
  )
}
