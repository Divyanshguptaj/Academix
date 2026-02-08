import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaSearch, FaFilter, FaUser, FaBook, FaCalendar } from "react-icons/fa"
import { format } from "date-fns"

export default function RefundManagement() {
  const { user } = useSelector((state) => state.profile)
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchRefunds()
    }
  }, [user])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_REFUND_REQUESTS)
      setRefunds(response.data.data)
    } catch (error) {
      console.error("Error fetching refunds:", error)
      setError("Failed to load refund requests")
    } finally {
      setLoading(false)
    }
  }

  const handleRefundAction = async (refundId, action, reason = "") => {
    try {
      const endpoint = action === "process" 
        ? adminEndpoints.PROCESS_REFUND.replace(":id", refundId)
        : adminEndpoints.REJECT_REFUND.replace(":id", refundId)
      
      await apiConnector("PUT", endpoint, { reason })
      fetchRefunds() // Refresh the list
    } catch (error) {
      console.error("Error processing refund:", error)
      setError("Failed to process refund")
    }
  }

  const filteredAndSortedRefunds = refunds
    .filter(refund => {
      const matchesSearch = refund.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           refund.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           refund.course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || refund.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortBy === "createdAt" || sortBy === "processedAt") {
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
          onClick={fetchRefunds}
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
          <h1 className="text-3xl font-bold text-richblack-50">Refund Management</h1>
          <p className="text-richblack-300 mt-1">Manage refund requests and process payments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchRefunds}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
              <input
                type="text"
                placeholder="Search by student, course, or transaction ID..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              >
                <option value="createdAt">Date Requested</option>
                <option value="amount">Amount</option>
                <option value="student">Student Name</option>
                <option value="course">Course Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 hover:bg-richblack-500 transition-colors"
              >
                <FaFilter className={`text-lg ${sortOrder === "desc" ? "text-yellow-400" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-richblack-700 rounded-lg border border-richblack-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-richblack-600 border-b border-richblack-500">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Processed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-600">
              {filteredAndSortedRefunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-richblack-600 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={refund.student?.image} alt={refund.student?.firstName} className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <div className="text-sm font-medium text-richblack-50">
                          {refund.student?.firstName} {refund.student?.lastName}
                        </div>
                        <div className="text-sm text-richblack-400">{refund.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={refund.course?.thumbnail} alt={refund.course?.courseName} className="h-10 w-10 rounded-md mr-3" />
                      <div>
                        <div className="text-sm font-medium text-richblack-50">
                          {refund.course?.courseName}
                        </div>
                        <div className="text-sm text-richblack-400">{refund.course?.instructor?.firstName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    <span className="font-semibold text-green-400">₹{refund.amount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      refund.status === "approved" ? "bg-green-100 text-green-800" :
                      refund.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    <div className="flex items-center">
                      <FaCalendar className="mr-1 text-richblack-400" />
                      {format(new Date(refund.createdAt), "MMM dd, yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    {refund.processedAt ? format(new Date(refund.processedAt), "MMM dd, yyyy") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {refund.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleRefundAction(refund._id, "process")}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle className="mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRefundAction(refund._id, "reject")}
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

        {filteredAndSortedRefunds.length === 0 && (
          <div className="text-center py-10 text-richblack-400">
            No refund requests found matching your criteria.
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Requests</h3>
          <p className="text-2xl font-bold text-blue-400">{refunds.length}</p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {refunds.filter(r => r.status === "pending").length}
          </p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Approved</h3>
          <p className="text-2xl font-bold text-green-400">
            {refunds.filter(r => r.status === "approved").length}
          </p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Rejected</h3>
          <p className="text-2xl font-bold text-red-400">
            {refunds.filter(r => r.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <h3 className="text-lg font-semibold text-richblack-50 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-richblack-600 p-4 rounded-lg">
            <h4 className="text-sm text-richblack-300 mb-2">Total Amount Requested</h4>
            <p className="text-2xl font-bold text-yellow-400">
              ₹{refunds.reduce((total, refund) => total + refund.amount, 0)}
            </p>
          </div>
          <div className="bg-richblack-600 p-4 rounded-lg">
            <h4 className="text-sm text-richblack-300 mb-2">Pending Amount</h4>
            <p className="text-2xl font-bold text-orange-400">
              ₹{refunds.filter(r => r.status === "pending").reduce((total, refund) => total + refund.amount, 0)}
            </p>
          </div>
          <div className="bg-richblack-600 p-4 rounded-lg">
            <h4 className="text-sm text-richblack-300 mb-2">Processed Amount</h4>
            <p className="text-2xl font-bold text-green-400">
              ₹{refunds.filter(r => r.status !== "pending").reduce((total, refund) => total + refund.amount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}