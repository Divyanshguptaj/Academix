import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { Doughnut, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js"
import { FaUsers, FaBook, FaRupeeSign } from "react-icons/fa"
import RefreshButton from "../../common/RefreshButton"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const TOOLTIP_STYLE = {
  backgroundColor: "#161D29",
  borderColor: "#2C333F",
  borderWidth: 1,
  titleColor: "#F1F2FF",
  bodyColor: "#999DAA",
  padding: 10,
  cornerRadius: 8,
}

const LEGEND_STYLE = {
  labels: {
    color: "#999DAA",
    font: { size: 12 },
    padding: 16,
    usePointStyle: true,
    pointStyleWidth: 8,
  },
}

const GRID_COLOR = "rgba(255,255,255,0.06)"
const TICK_COLOR = "#6B7280"

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

  const s = stats || {}
  const totalUsers = s.totalUsers ?? 0
  const studentCount = s.studentCount ?? 0
  const instructorCount = s.instructorCount ?? 0
  const adminCount = s.adminCount ?? 0
  const totalCourses = s.totalCourses ?? 0
  const publishedCourses = s.publishedCourses ?? 0
  const draftCourses = s.draftCourses ?? 0
  const totalRevenue = s.totalRevenue ?? 0
  const monthlyRevenue = s.monthlyRevenue ?? 0
  const pendingRevenue = s.pendingRevenue ?? 0

  const publishRate = totalCourses > 0 ? Math.round((publishedCourses / totalCourses) * 100) : 0
  const instructorRatio = totalUsers > 0 ? Math.round((instructorCount / totalUsers) * 100) : 0
  const avgRevPerCourse = publishedCourses > 0 ? Math.round(totalRevenue / publishedCourses) : 0
  const monthlyShare = totalRevenue > 0 ? Math.round((monthlyRevenue / totalRevenue) * 100) : 0

  // Chart data
  const userDoughnutData = {
    labels: ["Students", "Instructors", "Admins"],
    datasets: [{
      data: [studentCount, instructorCount, adminCount],
      backgroundColor: ["rgba(96,165,250,0.75)", "rgba(167,139,250,0.75)", "rgba(251,191,36,0.75)"],
      borderColor: ["rgba(96,165,250,1)", "rgba(167,139,250,1)", "rgba(251,191,36,1)"],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }

  const courseDoughnutData = {
    labels: ["Published", "Draft"],
    datasets: [{
      data: [publishedCourses, draftCourses],
      backgroundColor: ["rgba(52,211,153,0.75)", "rgba(100,116,139,0.75)"],
      borderColor: ["rgba(52,211,153,1)", "rgba(100,116,139,1)"],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }

  const revenueBarData = {
    labels: ["Total", "This Month", "Pending"],
    datasets: [{
      label: "Revenue (₹)",
      data: [totalRevenue, monthlyRevenue, pendingRevenue],
      backgroundColor: [
        "rgba(251,191,36,0.7)",
        "rgba(52,211,153,0.7)",
        "rgba(251,146,60,0.7)",
      ],
      borderColor: [
        "rgba(251,191,36,1)",
        "rgba(52,211,153,1)",
        "rgba(251,146,60,1)",
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const doughnutOptions = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: LEGEND_STYLE,
      tooltip: { ...TOOLTIP_STYLE, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_STYLE,
        callbacks: { label: (ctx) => ` ₹${ctx.raw.toLocaleString("en-IN")}` },
      },
    },
    scales: {
      x: {
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, font: { size: 12 } },
        border: { color: GRID_COLOR },
      },
      y: {
        grid: { color: GRID_COLOR },
        ticks: {
          color: TICK_COLOR,
          font: { size: 11 },
          callback: (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`,
        },
        border: { color: GRID_COLOR },
      },
    },
  }

  const ratios = [
    {
      label: "Course Publish Rate",
      value: `${publishRate}%`,
      sub: `${publishedCourses} of ${totalCourses} courses`,
      color: "text-green-400",
      bar: "bg-green-400",
      pct: publishRate,
    },
    {
      label: "Instructor Ratio",
      value: `${instructorRatio}%`,
      sub: `${instructorCount} of ${totalUsers} users`,
      color: "text-purple-400",
      bar: "bg-purple-400",
      pct: instructorRatio,
    },
    {
      label: "Avg Revenue / Course",
      value: `₹${avgRevPerCourse.toLocaleString("en-IN")}`,
      sub: "per published course",
      color: "text-yellow-400",
      bar: null,
      pct: null,
    },
    {
      label: "Monthly Revenue Share",
      value: `${monthlyShare}%`,
      sub: "of total revenue",
      color: "text-blue-400",
      bar: "bg-blue-400",
      pct: monthlyShare,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Analytics & Reports</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Platform overview — live data from all services</p>
        </div>
        <RefreshButton onClick={fetchStats} loading={loading || refreshing} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Doughnut */}
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-richblack-100">User Distribution</h3>
              <p className="text-xs text-richblack-500">{totalUsers.toLocaleString()} total</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ maxHeight: 200 }}>
            {totalUsers > 0 ? (
              <Doughnut data={userDoughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-richblack-500">No user data</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-richblack-700 pt-4">
            <div>
              <p className="text-base font-bold text-blue-400">{studentCount.toLocaleString()}</p>
              <p className="text-xs text-richblack-500 mt-0.5">Students</p>
            </div>
            <div>
              <p className="text-base font-bold text-purple-400">{instructorCount.toLocaleString()}</p>
              <p className="text-xs text-richblack-500 mt-0.5">Instructors</p>
            </div>
            <div>
              <p className="text-base font-bold text-yellow-400">{adminCount.toLocaleString()}</p>
              <p className="text-xs text-richblack-500 mt-0.5">Admins</p>
            </div>
          </div>
        </div>

        {/* Course Doughnut */}
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FaBook className="text-green-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-richblack-100">Course Distribution</h3>
              <p className="text-xs text-richblack-500">{totalCourses.toLocaleString()} total</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ maxHeight: 200 }}>
            {totalCourses > 0 ? (
              <Doughnut data={courseDoughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-sm text-richblack-500">No course data</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center border-t border-richblack-700 pt-4">
            <div>
              <p className="text-base font-bold text-green-400">{publishedCourses.toLocaleString()}</p>
              <p className="text-xs text-richblack-500 mt-0.5">Published</p>
            </div>
            <div>
              <p className="text-base font-bold text-richblack-400">{draftCourses.toLocaleString()}</p>
              <p className="text-xs text-richblack-500 mt-0.5">Draft</p>
            </div>
          </div>
        </div>

        {/* Revenue Bar */}
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <FaRupeeSign className="text-yellow-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-richblack-100">Revenue Breakdown</h3>
              <p className="text-xs text-richblack-500">₹{totalRevenue.toLocaleString("en-IN")} total</p>
            </div>
          </div>
          <div className="flex-1">
            <Bar data={revenueBarData} options={barOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-richblack-700 pt-4">
            <div>
              <p className="text-base font-bold text-yellow-400">₹{(totalRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-richblack-500 mt-0.5">Total</p>
            </div>
            <div>
              <p className="text-base font-bold text-green-400">₹{(monthlyRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-richblack-500 mt-0.5">Monthly</p>
            </div>
            <div>
              <p className="text-base font-bold text-orange-400">₹{(pendingRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-richblack-500 mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-5">Key Platform Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ratios.map((item) => (
            <div key={item.label} className="bg-richblack-700/50 rounded-xl p-4">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs font-medium text-richblack-300 mt-1.5">{item.label}</p>
              <p className="text-xs text-richblack-500 mt-0.5">{item.sub}</p>
              {item.bar && item.pct != null && (
                <div className="mt-3 h-1.5 bg-richblack-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: totalRevenue, color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
          { label: "Monthly Revenue", value: monthlyRevenue, color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/5" },
          { label: "Pending Revenue", value: pendingRevenue, color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-5`}>
            <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>
              ₹{card.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
