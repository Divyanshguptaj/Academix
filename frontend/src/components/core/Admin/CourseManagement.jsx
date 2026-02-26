import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaBook, FaCheckCircle, FaTimesCircle, FaSearch, FaTimes, FaTag, FaUsers } from "react-icons/fa"
import { format } from "date-fns"

const STATUS_BADGE = {
  Published: "bg-green-500/15 text-green-300 border-green-500/20",
  Draft: "bg-richblack-600/50 text-richblack-400 border-richblack-500/30",
  Pending: "bg-orange-500/15 text-orange-300 border-orange-500/20",
}

export default function CourseManagement() {
  const { user } = useSelector((state) => state.profile)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchCourses()
  }, [user])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_ALL_COURSES)
      const list = response?.data?.data || []
      setCourses(Array.isArray(list) ? list : [])
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleCourseAction = async (courseId, action, courseName) => {
    setActionLoading(`${courseId}-${action}`)
    try {
      const endpoint = action === "approve" ? adminEndpoints.APPROVE_COURSE : adminEndpoints.REJECT_COURSE
      await apiConnector("POST", endpoint, { courseId })
      toast.success(`Course "${courseName}" ${action === "approve" ? "approved" : "rejected"}`)
      fetchCourses()
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action} course`)
    } finally {
      setActionLoading(null)
    }
  }

  const getCategoryName = (cat) => (typeof cat === "string" ? cat : cat?.name || "")

  const uniqueCategories = [...new Set(courses.map((c) => getCategoryName(c.category)).filter(Boolean))]

  const filtered = courses
    .filter((course) => {
      const q = searchTerm.toLowerCase()
      const instructorName = `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.toLowerCase()
      const catName = getCategoryName(course.category).toLowerCase()
      const matchesSearch =
        (course.courseName || "").toLowerCase().includes(q) ||
        instructorName.includes(q) ||
        catName.includes(q)
      const matchesStatus = statusFilter === "all" || course.status === statusFilter
      const matchesCategory = categoryFilter === "all" || getCategoryName(course.category) === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === "createdAt") {
        return sortOrder === "asc" ? new Date(av || 0) - new Date(bv || 0) : new Date(bv || 0) - new Date(av || 0)
      }
      if (typeof av === "string") return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortOrder === "asc" ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0)
    })

  const enrollmentCount = (course) =>
    Array.isArray(course.studentsEnrolled)
      ? course.studentsEnrolled.length
      : course.enrolledStudents || 0

  const statCards = [
    { label: "Total Courses", value: courses.length, color: "text-blue-400" },
    { label: "Published", value: courses.filter((c) => c.status === "Published").length, color: "text-green-400" },
    { label: "Pending Review", value: courses.filter((c) => c.status === "Pending").length, color: "text-orange-400" },
    { label: "Draft", value: courses.filter((c) => c.status === "Draft").length, color: "text-richblack-400" },
    { label: "Total Enrolled", value: courses.reduce((s, c) => s + enrollmentCount(c), 0), color: "text-purple-400" },
  ]

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Course Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Review and approve courses submitted by instructors</p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-richblack-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
          <input
            type="text"
            placeholder="Search by course name, instructor, or category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-yellow-400/50"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="Published">Published</option>
          <option value="Pending">Pending Review</option>
          <option value="Draft">Draft</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="createdAt">Date Created</option>
          <option value="courseName">Course Name</option>
          <option value="price">Price</option>
        </select>

        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 hover:bg-richblack-600 transition-colors"
        >
          {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-richblack-700 border-b border-richblack-600">
                {["Course", "Instructor", "Category", "Status", "Price", "Enrolled", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-richblack-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {filtered.map((course) => {
                const catName = getCategoryName(course.category)
                const enrolled = enrollmentCount(course)
                const approveLoading = actionLoading === `${course._id}-approve`
                const rejectLoading = actionLoading === `${course._id}-reject`
                return (
                  <tr key={course._id} className="hover:bg-richblack-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail}
                          alt={course.courseName}
                          onError={(e) => { e.currentTarget.style.display = "none" }}
                          className="w-12 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-richblack-5 truncate max-w-[180px]">
                            {course.courseName}
                          </p>
                          <p className="text-xs text-richblack-500">
                            {course.createdAt ? format(new Date(course.createdAt), "MMM dd, yyyy") : "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-300">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </td>
                    <td className="px-5 py-3.5">
                      {catName ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          <FaTag className="text-[10px]" /> {catName}
                        </span>
                      ) : (
                        <span className="text-xs text-richblack-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[course.status] || "bg-richblack-600 text-richblack-300 border-richblack-500"}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-300">
                      {course.price ? `₹${course.price.toLocaleString("en-IN")}` : "Free"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-richblack-300">
                        <FaUsers className="text-xs text-richblack-500" />
                        {enrolled}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {course.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCourseAction(course._id, "approve", course.courseName)}
                            disabled={approveLoading || rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaCheckCircle className="text-xs" />
                            {approveLoading ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleCourseAction(course._id, "reject", course.courseName)}
                            disabled={approveLoading || rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaTimesCircle className="text-xs" />
                            {rejectLoading ? "…" : "Reject"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-richblack-400 text-sm">
            No courses found matching your criteria.
          </div>
        )}
      </div>

      <p className="text-xs text-richblack-500 text-right">
        Showing {filtered.length} of {courses.length} courses
      </p>
    </div>
  )
}
