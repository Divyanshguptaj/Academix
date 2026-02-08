import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaBook, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter, FaSort, FaTag, FaUserTie } from "react-icons/fa"
import { format } from "date-fns"

export default function CourseManagement() {
  const { user } = useSelector((state) => state.profile)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_ALL_COURSES)
      setCourses(response.data.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setError("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleCourseApproval = async (courseId, action) => {
    try {
      const endpoint = action === "approve" 
        ? adminEndpoints.APPROVE_COURSE.replace(":id", courseId)
        : adminEndpoints.REJECT_COURSE.replace(":id", courseId)
      
      await apiConnector("PUT", endpoint, {})
      fetchCourses() // Refresh the list
    } catch (error) {
      console.error("Error updating course status:", error)
      setError("Failed to update course status")
    }
  }

  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || course.status === statusFilter
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        return sortOrder === "asc" 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue)
      }
      
      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const uniqueCategories = [...new Set(courses.map(course => course.category).filter(Boolean))]

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
          onClick={fetchCourses}
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
          <h1 className="text-3xl font-bold text-richblack-50">Course Management</h1>
          <p className="text-richblack-300 mt-1">Manage all courses and their approval status</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCourses}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
              <input
                type="text"
                placeholder="Search by course name, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="courseName">Course Name</option>
                <option value="instructor">Instructor</option>
                <option value="category">Category</option>
                <option value="price">Price</option>
                <option value="enrolledStudents">Enrollments</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 hover:bg-richblack-500 transition-colors"
              >
                <FaSort className={`text-lg ${sortOrder === "desc" ? "text-yellow-400" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-richblack-700 rounded-lg border border-richblack-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-richblack-600 border-b border-richblack-500">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Enrollments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-600">
              {filteredAndSortedCourses.map((course) => (
                <tr key={course._id} className="hover:bg-richblack-600 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img className="h-12 w-12 rounded-md" src={course.thumbnail} alt={course.courseName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-richblack-50">
                          {course.courseName}
                        </div>
                        <div className="text-sm text-richblack-400">
                          {course.description?.substring(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={course.instructor?.image} alt={course.instructor?.firstName} className="h-8 w-8 rounded-full mr-2" />
                      <span className="text-sm text-richblack-300">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      <FaTag className="mr-1" />
                      {course.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === "Published" ? "bg-green-100 text-green-800" :
                      course.status === "Draft" ? "bg-yellow-100 text-yellow-800" :
                      "bg-orange-100 text-orange-800"
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    ₹{course.price || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    {course.enrolledStudents || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {course.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleCourseApproval(course._id, "approve")}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle className="mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleCourseApproval(course._id, "reject")}
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <FaTimesCircle className="mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedCourses.length === 0 && (
          <div className="text-center py-10 text-richblack-400">
            No courses found matching your criteria.
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Courses</h3>
          <p className="text-2xl font-bold text-blue-400">{courses.length}</p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Published</h3>
          <p className="text-2xl font-bold text-green-400">
            {courses.filter(c => c.status === "Published").length}
          </p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Pending Review</h3>
          <p className="text-2xl font-bold text-orange-400">
            {courses.filter(c => c.status === "Pending").length}
          </p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Draft</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {courses.filter(c => c.status === "Draft").length}
          </p>
        </div>
      </div>
    </div>
  )
}