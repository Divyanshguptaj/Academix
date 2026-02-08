import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUsers, FaBook, FaRupeeSign, FaChartLine, FaCalendar, FaDownload, FaFilter } from "react-icons/fa"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { format } from "date-fns"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js"
import "chartjs-adapter-date-fns"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

export default function AnalyticsDashboard() {
  const { user } = useSelector((state) => state.profile)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [chartType, setChartType] = useState("line")

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", `${adminEndpoints.GET_ANALYTICS}?timeRange=${timeRange}`)
      setAnalytics(response.data.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await apiConnector("GET", `${adminEndpoints.EXPORT_DATA}?timeRange=${timeRange}&format=csv`)
      // Create download link for CSV
      const blob = new Blob([response.data], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
      setError("Failed to export data")
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
          onClick={fetchAnalytics}
          className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Chart configurations
  const revenueChartData = {
    labels: analytics?.revenueData?.map(data => format(new Date(data.date), "MMM dd")) || [],
    datasets: [
      {
        label: "Daily Revenue",
        data: analytics?.revenueData?.map(data => data.revenue) || [],
        borderColor: "rgb(250, 204, 21)",
        backgroundColor: "rgba(250, 204, 21, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const enrollmentChartData = {
    labels: analytics?.enrollmentData?.map(data => format(new Date(data.date), "MMM dd")) || [],
    datasets: [
      {
        label: "Daily Enrollments",
        data: analytics?.enrollmentData?.map(data => data.enrollments) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  }

  const userGrowthChartData = {
    labels: analytics?.userGrowthData?.map(data => format(new Date(data.date), "MMM dd")) || [],
    datasets: [
      {
        label: "New Users",
        data: analytics?.userGrowthData?.map(data => data.newUsers) || [],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        tension: 0.4,
      },
      {
        label: "Active Users",
        data: analytics?.userGrowthData?.map(data => data.activeUsers) || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.4,
      },
    ],
  }

  const courseDistributionData = {
    labels: analytics?.courseDistribution?.map(cat => cat.category) || [],
    datasets: [
      {
        data: analytics?.courseDistribution?.map(cat => cat.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(167, 139, 250, 0.8)",
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9ca3af",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
        ticks: {
          color: "#9ca3af",
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-richblack-50">Analytics Dashboard</h1>
          <p className="text-richblack-300 mt-1">Comprehensive insights and metrics for your platform</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-richblack-400" />
            <span className="text-richblack-300">Time Range:</span>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === range
                    ? "bg-yellow-500 text-black font-medium"
                    : "bg-richblack-600 text-richblack-300 hover:bg-richblack-500"
                } transition-colors`}
              >
                {range === "7d" ? "Last 7 Days" : 
                 range === "30d" ? "Last 30 Days" : 
                 range === "90d" ? "Last 3 Months" : "Last Year"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Revenue</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                ₹{analytics?.totalRevenue || 0}
              </p>
            </div>
            <FaRupeeSign className="text-4xl text-yellow-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">This Period: ₹{analytics?.periodRevenue || 0}</span>
            <span className={`font-medium ${analytics?.revenueGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
              {analytics?.revenueGrowth >= 0 ? "+" : ""}{analytics?.revenueGrowth || 0}%
            </span>
          </div>
        </div>

        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Users</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {analytics?.totalUsers || 0}
              </p>
            </div>
            <FaUsers className="text-4xl text-blue-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">New Users: {analytics?.newUsers || 0}</span>
            <span className={`font-medium ${analytics?.userGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
              {analytics?.userGrowth >= 0 ? "+" : ""}{analytics?.userGrowth || 0}%
            </span>
          </div>
        </div>

        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Courses</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {analytics?.totalCourses || 0}
              </p>
            </div>
            <FaBook className="text-4xl text-green-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">Active Courses: {analytics?.activeCourses || 0}</span>
            <span className={`font-medium ${analytics?.courseGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
              {analytics?.courseGrowth >= 0 ? "+" : ""}{analytics?.courseGrowth || 0}%
            </span>
          </div>
        </div>

        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300">Total Enrollments</p>
              <p className="text-2xl font-bold text-richblack-50 mt-1">
                {analytics?.totalEnrollments || 0}
              </p>
            </div>
            <FaChartLine className="text-4xl text-purple-400" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-richblack-400">This Period: {analytics?.periodEnrollments || 0}</span>
            <span className={`font-medium ${analytics?.enrollmentGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
              {analytics?.enrollmentGrowth >= 0 ? "+" : ""}{analytics?.enrollmentGrowth || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-4">Revenue Trends</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Enrollment Chart */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-4">Course Enrollments</h3>
          <div className="h-64">
            <Bar data={enrollmentChartData} options={chartOptions} />
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-4">User Growth</h3>
          <div className="h-64">
            <Line data={userGrowthChartData} options={chartOptions} />
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-4">Course Distribution by Category</h3>
          <div className="h-64">
            <Doughnut data={courseDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      {analytics?.topPerformingCourses && (
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-4">Top Performing Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topPerformingCourses.map((course, index) => (
              <div key={course._id} className="bg-richblack-600 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-richblack-50">{course.courseName}</span>
                  <span className="text-xs text-richblack-400">#{index + 1}</span>
                </div>
                <div className="flex justify-between text-sm text-richblack-300">
                  <span>Enrollments: {course.enrollments}</span>
                  <span>Revenue: ₹{course.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <h3 className="text-lg font-semibold text-richblack-50 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-richblack-600 p-4 rounded-lg">
            <span className="text-richblack-400">Average Revenue per User:</span>
            <p className="font-semibold text-richblack-50 mt-1">
              ₹{analytics?.avgRevenuePerUser || 0}
            </p>
          </div>
          <div className="bg-richblack-600 p-4 rounded-lg">
            <span className="text-richblack-400">Average Enrollments per Course:</span>
            <p className="font-semibold text-richblack-50 mt-1">
              {analytics?.avgEnrollmentsPerCourse || 0}
            </p>
          </div>
          <div className="bg-richblack-600 p-4 rounded-lg">
            <span className="text-richblack-400">Refund Rate:</span>
            <p className="font-semibold text-richblack-50 mt-1">
              {analytics?.refundRate || 0}%
            </p>
          </div>
          <div className="bg-richblack-600 p-4 rounded-lg">
            <span className="text-richblack-400">Active Instructors:</span>
            <p className="font-semibold text-richblack-50 mt-1">
              {analytics?.activeInstructors || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}