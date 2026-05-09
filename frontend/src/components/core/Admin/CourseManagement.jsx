import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaBook, FaCheckCircle, FaTimesCircle, FaSearch, FaTimes, FaTag, FaUsers } from "react-icons/fa"
import { format } from "date-fns"
import RefreshButton from "../../common/RefreshButton"

const STATUS_BADGE = {
  Published: "bg-green-500/15 text-green-300 border-green-500/20",
  Draft: "bg-richblack-600/50 text-richblack-400 border-richblack-500/30",
}

export default function CourseManagement() {
  const { user } = useSelector((state) => state.profile)

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  // Search with debounce
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Filters
  const [statusFilter, setStatusFilter] = useState("all")

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)

  // Debounce search — reset to page 1 on new query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    if (user?.accountType === "Admin") fetchCourses()
  }, [user, page, debouncedSearch, statusFilter])

  const fetchCourses = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        page,
        limit: 15,
        search: debouncedSearch,
        ...(statusFilter !== "all" && { status: statusFilter }),
      }).toString()

      const res = await apiConnector("GET", `${adminEndpoints.GET_ALL_COURSES}?${params}`)
      const data = res?.data?.data
      // Handle both new wrapped format { courses, totalCourses, totalPages }
      // and old flat format where data is the array directly
      setCourses(data?.courses || (Array.isArray(data) ? data : []))
      setTotalPages(data?.totalPages || 1)
      setTotalCourses(data?.totalCourses || (Array.isArray(data) ? data.length : 0))
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
      setRefreshing(false)
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

  const enrollmentCount = (course) =>
    Array.isArray(course.studentsEnrolled)
      ? course.studentsEnrolled.length
      : course.enrolledStudents || 0

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
          <p className="text-sm text-richblack-400 mt-0.5">
            Review and approve courses submitted by instructors
          </p>
        </div>
        <RefreshButton onClick={fetchCourses} loading={loading || refreshing} />
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
          <input
            type="text"
            placeholder="Search by course name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-richblack-800 border border-richblack-700 rounded-xl text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-yellow-400/50 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-richblack-200"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-richblack-800 border border-richblack-700 rounded-xl text-sm text-richblack-200 focus:outline-none focus:border-yellow-400/50"
        >
          <option value="all">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-richblack-700 border-b border-richblack-600">
                {["Course", "Instructor", "Category", "Status", "Price", "Enrolled", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-richblack-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {courses.map((course) => {
                const catName = typeof course.category === "string" ? course.category : course.category?.name || ""
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
                      <div className="flex gap-2">
                        {course.status === "Published" && (
                          <button
                            onClick={() => handleCourseAction(course._id, "reject", course.courseName)}
                            disabled={rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaTimesCircle className="text-xs" />
                            {rejectLoading ? "…" : "Unpublish"}
                          </button>
                        )}
                        {course.status === "Draft" && (
                          <button
                            onClick={() => handleCourseAction(course._id, "approve", course.courseName)}
                            disabled={approveLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaCheckCircle className="text-xs" />
                            {approveLoading ? "…" : "Publish"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 text-richblack-400">
            <FaBook className="text-3xl mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {debouncedSearch || statusFilter !== "all"
                ? "No courses match your filters."
                : "No courses found."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCourses > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-richblack-500">
            Showing {courses.length} of {totalCourses} courses
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || refreshing}
                className="px-3 py-1.5 rounded bg-richblack-800 border border-richblack-700 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…")
                  acc.push(n)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="text-richblack-500 px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors border ${
                        page === item
                          ? "bg-yellow-400 text-black font-bold border-yellow-400"
                          : "bg-richblack-800 border-richblack-700 text-white hover:bg-richblack-700"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || refreshing}
                className="px-3 py-1.5 rounded bg-richblack-800 border border-richblack-700 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
