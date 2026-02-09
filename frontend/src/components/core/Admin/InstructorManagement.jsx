import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUserTie, FaCheckCircle, FaTimesCircle, FaEye, FaUsers, FaBook, FaRupeeSign, FaClock, FaFilter, FaSearch, FaSync, FaCalendar, FaEnvelope, FaStar, FaTrophy } from "react-icons/fa"
import { format } from "date-fns"

export default function InstructorManagement() {
  const { user } = useSelector((state) => state.profile)
  const [instructors, setInstructors] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("applications")
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchInstructorData()
    }
  }, [user, activeTab])

  const fetchInstructorData = async () => {
    try {
      setRefreshing(true)
      if (activeTab === "applications") {
        const response = await apiConnector("GET", adminEndpoints.GET_INSTRUCTOR_APPLICATIONS)
        setApplications(response.data.data)
      } else {
        const response = await apiConnector("GET", adminEndpoints.GET_ALL_INSTRUCTORS)
        setInstructors(response.data.data)
      }
      setError(null)
    } catch (error) {
      console.error("Error fetching instructor data:", error)
      setError("Failed to load instructor data")
    } finally {
      setLoading(false)
      setRefreshing(false)
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
          <p className="text-richblack-300 font-medium">Loading instructor data...</p>
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
            onClick={fetchInstructorData}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg hover:bg-yellow-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-richblack-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-richblack-800 to-richblack-700 p-6 md:p-8 rounded-2xl border border-richblack-600 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserTie className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-richblack-5">Instructor Management</h1>
                <p className="text-richblack-300 text-sm md:text-base">
                  Manage instructor applications and approved instructors
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={fetchInstructorData}
            disabled={refreshing}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-richblack-900 px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-richblack-800 rounded-2xl border border-richblack-700 shadow-xl overflow-hidden">
          <div className="flex border-b border-richblack-700">
            <button
              onClick={() => setActiveTab("applications")}
              className={`relative flex-1 py-5 px-6 text-sm font-semibold transition-all duration-300 ${
                activeTab === "applications"
                  ? "text-yellow-50 bg-richblack-700"
                  : "text-richblack-300 hover:text-richblack-50 hover:bg-richblack-700/50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === "applications" 
                    ? "bg-orange-500/20" 
                    : "bg-richblack-600"
                }`}>
                  <FaClock className={activeTab === "applications" ? "text-orange-400" : "text-richblack-400"} />
                </div>
                <div className="text-left">
                  <div className="text-base">Pending Applications</div>
                  <div className={`text-xs font-normal ${activeTab === "applications" ? "text-yellow-100" : "text-richblack-400"}`}>
                    {applications.length} waiting
                  </div>
                </div>
              </div>
              {activeTab === "applications" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`relative flex-1 py-5 px-6 text-sm font-semibold transition-all duration-300 ${
                activeTab === "approved"
                  ? "text-yellow-50 bg-richblack-700"
                  : "text-richblack-300 hover:text-richblack-50 hover:bg-richblack-700/50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === "approved" 
                    ? "bg-green-500/20" 
                    : "bg-richblack-600"
                }`}>
                  <FaUsers className={activeTab === "approved" ? "text-green-400" : "text-richblack-400"} />
                </div>
                <div className="text-left">
                  <div className="text-base">Approved Instructors</div>
                  <div className={`text-xs font-normal ${activeTab === "approved" ? "text-yellow-100" : "text-richblack-400"}`}>
                    {instructors.length} active
                  </div>
                </div>
              </div>
              {activeTab === "approved" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-richblack-800 border-b border-richblack-700">
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-richblack-400 group-focus-within:text-yellow-50 transition-colors" />
              <input
                type="text"
                placeholder={`Search ${activeTab === "applications" ? "applications" : "instructors"} by name or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-richblack-700 border border-richblack-600 rounded-xl text-richblack-5 placeholder:text-richblack-400 focus:outline-none focus:border-yellow-50 focus:ring-2 focus:ring-yellow-50/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-richblack-400 hover:text-richblack-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "applications" && (
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto bg-richblack-700 rounded-full flex items-center justify-center mb-4">
                      <FaClock className="text-4xl text-richblack-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-richblack-5 mb-2">No Pending Applications</h3>
                    <p className="text-richblack-400">
                      {searchTerm ? "No applications match your search criteria." : "All instructor applications have been processed."}
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <div key={app._id} className="group bg-richblack-700 rounded-xl p-6 border border-richblack-600 hover:border-richblack-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img 
                              src={app.image} 
                              alt={app.firstName} 
                              className="h-16 w-16 rounded-xl object-cover ring-2 ring-richblack-600 group-hover:ring-orange-400 transition-all duration-300" 
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                              <FaClock className="text-xs text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-richblack-5 mb-1">
                              {app.firstName} {app.lastName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-richblack-300 mb-2">
                              <FaEnvelope className="text-richblack-400" />
                              <span>{app.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-richblack-400">
                              <FaCalendar />
                              <span>Applied on {format(new Date(app.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleInstructorApproval(app._id, "approve")}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <FaCheckCircle />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleInstructorApproval(app._id, "reject")}
                            className="flex items-center justify-center space-x-2 bg-richblack-600 text-richblack-200 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 font-semibold border border-richblack-500 hover:border-red-600"
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
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto bg-richblack-700 rounded-full flex items-center justify-center mb-4">
                      <FaUsers className="text-4xl text-richblack-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-richblack-5 mb-2">No Instructors Found</h3>
                    <p className="text-richblack-400">
                      {searchTerm ? "No instructors match your search criteria." : "There are no approved instructors yet."}
                    </p>
                  </div>
                ) : (
                  filteredInstructors.map((instr) => (
                    <div key={instr._id} className="group bg-richblack-700 rounded-xl p-6 border border-richblack-600 hover:border-richblack-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="relative">
                            <img 
                              src={instr.image} 
                              alt={instr.firstName} 
                              className="h-16 w-16 rounded-xl object-cover ring-2 ring-richblack-600 group-hover:ring-green-400 transition-all duration-300" 
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                              <FaCheckCircle className="text-xs text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-richblack-5 mb-1">
                              {instr.firstName} {instr.lastName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-richblack-300 mb-3">
                              <FaEnvelope className="text-richblack-400" />
                              <span>{instr.email}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="flex items-center gap-2 bg-richblack-600 px-3 py-2 rounded-lg">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <FaBook className="text-blue-400 text-sm" />
                                </div>
                                <div>
                                  <div className="text-xs text-richblack-400">Courses</div>
                                  <div className="text-sm font-semibold text-richblack-5">{instr.courseCount || 0}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-richblack-600 px-3 py-2 rounded-lg">
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                  <FaRupeeSign className="text-yellow-400 text-sm" />
                                </div>
                                <div>
                                  <div className="text-xs text-richblack-400">Revenue</div>
                                  <div className="text-sm font-semibold text-richblack-5">₹{(instr.totalRevenue || 0).toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-richblack-600 px-3 py-2 rounded-lg">
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <FaUsers className="text-green-400 text-sm" />
                                </div>
                                <div>
                                  <div className="text-xs text-richblack-400">Students</div>
                                  <div className="text-sm font-semibold text-richblack-5">{instr.studentCount || 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleInstructorApproval(instr._id, "revoke")}
                            className="flex items-center justify-center space-x-2 bg-richblack-600 text-richblack-200 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 font-semibold border border-richblack-500 hover:border-red-600"
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
            <div className="group bg-richblack-800 rounded-2xl p-6 border border-richblack-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUserTie className="text-2xl text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-richblack-300 mb-1">Total Instructors</div>
                  <div className="text-3xl font-bold text-richblack-5">{instructors.length}</div>
                </div>
              </div>
              <div className="w-full h-2 bg-richblack-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            <div className="group bg-richblack-800 rounded-2xl p-6 border border-richblack-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBook className="text-2xl text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-richblack-300 mb-1">Total Courses</div>
                  <div className="text-3xl font-bold text-richblack-5">
                    {instructors.reduce((total, instr) => total + (instr.courseCount || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-richblack-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>

            <div className="group bg-richblack-800 rounded-2xl p-6 border border-richblack-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaRupeeSign className="text-2xl text-yellow-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-richblack-300 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-richblack-5">
                    ₹{instructors.reduce((total, instr) => total + (instr.totalRevenue || 0), 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-richblack-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}