import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUserTie, FaCheckCircle, FaTimesCircle, FaEye, FaUsers, FaBook, FaRupeeSign, FaClock, FaFilter, FaSearch } from "react-icons/fa"
import { format } from "date-fns"

export default function InstructorManagement() {
  const { user } = useSelector((state) => state.profile)
  const [instructors, setInstructors] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("applications")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchInstructorData()
    }
  }, [user, activeTab])

  const fetchInstructorData = async () => {
    try {
      setLoading(true)
      if (activeTab === "applications") {
        const response = await apiConnector("GET", adminEndpoints.GET_INSTRUCTOR_APPLICATIONS)
        setApplications(response.data.data)
      } else {
        const response = await apiConnector("GET", adminEndpoints.GET_ALL_INSTRUCTORS)
        setInstructors(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching instructor data:", error)
      setError("Failed to load instructor data")
    } finally {
      setLoading(false)
    }
  }

  const handleInstructorApproval = async (userId, action) => {
    try {
      const endpoint = action === "approve" 
        ? adminEndpoints.APPROVE_INSTRUCTOR.replace(":id", userId)
        : adminEndpoints.REVOKE_INSTRUCTOR.replace(":id", userId)
      
      await apiConnector("PUT", endpoint, {})
      fetchInstructorData() // Refresh the list
    } catch (error) {
      console.error("Error updating instructor status:", error)
      setError("Failed to update instructor status")
    }
  }

  const filteredApplications = applications.filter(app => 
    app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInstructors = instructors.filter(instr => 
    instr.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instr.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instr.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          onClick={fetchInstructorData}
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
          <h1 className="text-3xl font-bold text-richblack-50">Instructor Management</h1>
          <p className="text-richblack-300 mt-1">Manage instructor applications and approved instructors</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchInstructorData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-richblack-700 rounded-lg border border-richblack-600">
        <div className="flex border-b border-richblack-600">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === "applications"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-richblack-300 hover:text-richblack-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaClock />
              <span>Pending Applications ({applications.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === "approved"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-richblack-300 hover:text-richblack-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaUsers />
              <span>Approved Instructors ({instructors.length})</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-richblack-600">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "applications" ? "applications" : "instructors"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-richblack-700 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "applications" && (
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-10 text-richblack-400">
                  No pending instructor applications.
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div key={app._id} className="bg-richblack-600 rounded-lg p-6 border border-richblack-500">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img src={app.image} alt={app.firstName} className="h-16 w-16 rounded-full" />
                        <div>
                          <h3 className="text-lg font-semibold text-richblack-50">
                            {app.firstName} {app.lastName}
                          </h3>
                          <p className="text-richblack-300">{app.email}</p>
                          <p className="text-sm text-richblack-400">
                            Applied on {format(new Date(app.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row gap-2">
                        <button
                          onClick={() => handleInstructorApproval(app._id, "approve")}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleInstructorApproval(app._id, "reject")}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                          <FaTimesCircle />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="space-y-4">
              {filteredInstructors.length === 0 ? (
                <div className="text-center py-10 text-richblack-400">
                  No approved instructors found.
                </div>
              ) : (
                filteredInstructors.map((instr) => (
                  <div key={instr._id} className="bg-richblack-600 rounded-lg p-6 border border-richblack-500">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img src={instr.image} alt={instr.firstName} className="h-16 w-16 rounded-full" />
                        <div>
                          <h3 className="text-lg font-semibold text-richblack-50">
                            {instr.firstName} {instr.lastName}
                          </h3>
                          <p className="text-richblack-300">{instr.email}</p>
                          <div className="flex space-x-4 text-sm text-richblack-400 mt-2">
                            <span><FaBook className="inline mr-1" /> {instr.courseCount || 0} Courses</span>
                            <span><FaRupeeSign className="inline mr-1" /> ₹{instr.totalRevenue || 0} Revenue</span>
                            <span><FaUsers className="inline mr-1" /> {instr.studentCount || 0} Students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row gap-2">
                        <button
                          onClick={() => handleInstructorApproval(instr._id, "revoke")}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                          <FaTimesCircle />
                          <span>Revoke Access</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {activeTab === "approved" && instructors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
            <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Instructors</h3>
            <p className="text-2xl font-bold text-green-400">{instructors.length}</p>
          </div>
          <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
            <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Courses</h3>
            <p className="text-2xl font-bold text-blue-400">
              {instructors.reduce((total, instr) => total + (instr.courseCount || 0), 0)}
            </p>
          </div>
          <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
            <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-yellow-400">
              ₹{instructors.reduce((total, instr) => total + (instr.totalRevenue || 0), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}