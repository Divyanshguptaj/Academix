import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle, FaSearch, FaTimes, FaCalendar } from "react-icons/fa"
import { format } from "date-fns"

const decodeImg = (url) =>
  url?.replace(/&#x2F;/gi, "/").replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&") || ""

const STATUS_BADGE = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  approved: "bg-green-500/15 text-green-300 border-green-500/20",
  rejected: "bg-red-500/15 text-red-300 border-red-500/20",
}

export default function RefundManagement() {
  const { user } = useSelector((state) => state.profile)
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchRefunds()
  }, [user])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_REFUND_REQUESTS)
      setRefunds(response.data.data || [])
    } catch {
      toast.error("Failed to load refund requests")
    } finally {
      setLoading(false)
    }
  }

  const handleRefundAction = async (refundId, action, studentName) => {
    setActionLoading(`${refundId}-${action}`)
    try {
      const endpoint = action === "process"
        ? adminEndpoints.PROCESS_REFUND.replace(":id", refundId)
        : adminEndpoints.REJECT_REFUND.replace(":id", refundId)
      await apiConnector("PUT", endpoint, {})
      toast.success(`Refund for ${studentName} ${action === "process" ? "approved" : "rejected"}`)
      fetchRefunds()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to process refund")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = refunds
    .filter((r) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        (r.student?.firstName || "").toLowerCase().includes(q) ||
        (r.student?.lastName || "").toLowerCase().includes(q) ||
        (r.course?.courseName || "").toLowerCase().includes(q) ||
        (r.transactionId || "").toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === "createdAt" || sortBy === "processedAt") {
        return sortOrder === "asc" ? new Date(av || 0) - new Date(bv || 0) : new Date(bv || 0) - new Date(av || 0)
      }
      if (typeof av === "string") return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortOrder === "asc" ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0)
    })

  const totalAmount = refunds.reduce((s, r) => s + (r.amount || 0), 0)
  const pendingAmount = refunds.filter((r) => r.status === "pending").reduce((s, r) => s + (r.amount || 0), 0)
  const approvedAmount = refunds.filter((r) => r.status === "approved").reduce((s, r) => s + (r.amount || 0), 0)

  const statCards = [
    { label: "Total Requests", value: refunds.length, color: "text-blue-400" },
    { label: "Pending", value: refunds.filter((r) => r.status === "pending").length, color: "text-yellow-400" },
    { label: "Approved", value: refunds.filter((r) => r.status === "approved").length, color: "text-green-400" },
    { label: "Rejected", value: refunds.filter((r) => r.status === "rejected").length, color: "text-red-400" },
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
          <h1 className="text-2xl font-bold text-richblack-5">Refund Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Process and track student refund requests</p>
        </div>
        <button
          onClick={fetchRefunds}
          className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats + Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-richblack-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Requested", value: totalAmount, color: "text-blue-400", icon: FaRupeeSign },
          { label: "Pending Amount", value: pendingAmount, color: "text-yellow-400", icon: FaClock },
          { label: "Approved Amount", value: approvedAmount, color: "text-green-400", icon: FaCheckCircle },
        ].map((item) => (
          <div key={item.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-richblack-700`}>
              <item.icon className={`${item.color} text-base`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${item.color}`}>₹{item.value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-richblack-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
          <input
            type="text"
            placeholder="Search by student, course, or transaction ID…"
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="createdAt">Date Requested</option>
          <option value="amount">Amount</option>
          <option value="processedAt">Processed Date</option>
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
                {["Student", "Course", "Amount", "Status", "Requested", "Processed", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-richblack-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {filtered.map((refund) => {
                const studentName = `${refund.student?.firstName || ""} ${refund.student?.lastName || ""}`.trim()
                const img = decodeImg(refund.student?.image)
                const approveLoading = actionLoading === `${refund._id}-process`
                const rejectLoading = actionLoading === `${refund._id}-reject`
                return (
                  <tr key={refund._id} className="hover:bg-richblack-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={studentName}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(studentName)}`
                          }}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-richblack-5">{studentName || "—"}</p>
                          <p className="text-xs text-richblack-500">{refund.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm text-richblack-200 max-w-[160px] truncate">{refund.course?.courseName || "—"}</p>
                        {refund.course?.instructor && (
                          <p className="text-xs text-richblack-500">
                            by {refund.course.instructor?.firstName} {refund.course.instructor?.lastName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-green-400">
                        ₹{(refund.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[refund.status] || ""}`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">
                      {refund.createdAt ? format(new Date(refund.createdAt), "MMM dd, yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">
                      {refund.processedAt ? format(new Date(refund.processedAt), "MMM dd, yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {refund.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRefundAction(refund._id, "process", studentName)}
                            disabled={approveLoading || rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaCheckCircle className="text-xs" />
                            {approveLoading ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleRefundAction(refund._id, "reject", studentName)}
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
            No refund requests found matching your criteria.
          </div>
        )}
      </div>

      <p className="text-xs text-richblack-500 text-right">
        Showing {filtered.length} of {refunds.length} requests
      </p>
    </div>
  )
}
