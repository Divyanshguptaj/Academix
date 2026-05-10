import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaCheckCircle, FaTimesCircle, FaSearch, FaTimes, FaCalendar } from "react-icons/fa"
import { format } from "date-fns"
import RefreshButton from "../../common/RefreshButton"

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
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null) // { id, studentName }
  const [rejectReason, setRejectReason] = useState("")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    if (user?.accountType === "Admin") fetchRefunds()
  }, [user, page, statusFilter])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({ page, limit: 10, status: statusFilter }).toString()
      const response = await apiConnector("GET", `${adminEndpoints.GET_REFUND_REQUESTS}?${queryParams}`)
      const responseData = response?.data?.data
      
      // Safely handle both new object payload and legacy array payload
      setRefunds(responseData?.refunds || (Array.isArray(responseData) ? responseData : []))
      setTotalPages(responseData?.totalPages || 1)
      setTotalCount(responseData?.totalRefunds || (Array.isArray(responseData) ? responseData.length : 0))
    } catch {
      toast.error("Failed to load refund requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (refundId, studentName) => {
    setActionLoading(`${refundId}-process`)
    try {
      await apiConnector("PUT", adminEndpoints.PROCESS_REFUND.replace(":id", refundId), {})
      toast.success(`Refund for ${studentName} approved — student unenrolled`)
      fetchRefunds()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve refund")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectModal) return
    setActionLoading(`${rejectModal.id}-reject`)
    try {
      await apiConnector("PUT", adminEndpoints.REJECT_REFUND.replace(":id", rejectModal.id), {
        rejectionReason: rejectReason.trim() || undefined,
      })
      toast.success(`Refund for ${rejectModal.studentName} rejected`)
      setRejectModal(null)
      setRejectReason("")
      fetchRefunds()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject refund")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = refunds
    .filter((r) => {
      const q = debouncedSearch.toLowerCase()
      const matchesSearch =
        (r.student?.firstName || "").toLowerCase().includes(q) ||
        (r.student?.lastName || "").toLowerCase().includes(q) ||
        (r.course?.courseName || "").toLowerCase().includes(q) ||
        (r.transactionId || "").toLowerCase().includes(q)
      return matchesSearch // Status filter is now handled strictly by the backend
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === "createdAt" || sortBy === "processedAt") {
        return sortOrder === "asc" ? new Date(av || 0) - new Date(bv || 0) : new Date(bv || 0) - new Date(av || 0)
      }
      if (typeof av === "string") return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortOrder === "asc" ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0)
    })


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Refund Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Process and track student refund requests</p>
        </div>
        <RefreshButton onClick={fetchRefunds} loading={loading} />
      </div>


      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",      label: "All",      color: "text-richblack-300 border-richblack-600",  active: "bg-richblack-700 text-richblack-5 border-richblack-500" },
          { key: "pending",  label: "Pending",  color: "text-yellow-400 border-yellow-500/30",     active: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" },
          { key: "approved", label: "Approved", color: "text-green-400 border-green-500/30",       active: "bg-green-500/20 text-green-300 border-green-500/50" },
          { key: "rejected", label: "Rejected", color: "text-red-400 border-red-500/30",           active: "bg-red-500/20 text-red-300 border-red-500/50" },
        ].map(({ key, label, color, active }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === key ? active : `bg-richblack-800 ${color} hover:bg-richblack-700`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-richblack-600 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin" />
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((refund) => {
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
                            onClick={() => handleApprove(refund._id, studentName)}
                            disabled={approveLoading || rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaCheckCircle className="text-xs" />
                            {approveLoading ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: refund._id, studentName }); setRejectReason("") }}
                            disabled={approveLoading || rejectLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <FaTimesCircle className="text-xs" />
                            Reject
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

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-richblack-400 text-sm">
            No refund requests found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination & Result count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p className="text-xs text-richblack-500">
          Showing {filtered.length} of {totalCount} requests
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="px-3 py-1.5 rounded bg-richblack-800 border border-richblack-700 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition">Prev</button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button key={idx} onClick={() => setPage(idx + 1)} disabled={loading} className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors border border-richblack-700 ${page === idx + 1 ? 'bg-yellow-400 text-black font-bold border-yellow-400' : 'bg-richblack-800 text-white hover:bg-richblack-700'}`}>
                {idx + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="px-3 py-1.5 rounded bg-richblack-800 border border-richblack-700 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition">Next</button>
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-semibold text-richblack-5 text-lg">Reject Refund Request</h3>
                <p className="text-sm text-richblack-400 mt-0.5">{rejectModal.studentName}</p>
              </div>
              <button
                onClick={() => { setRejectModal(null); setRejectReason("") }}
                className="text-richblack-400 hover:text-richblack-200 mt-0.5 flex-shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-300">
              This will reject the refund request. The student will keep access to the course.
            </div>

            <label className="block text-sm font-medium text-richblack-300 mb-2">
              Rejection Reason <span className="text-richblack-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Explain why you are rejecting this refund request…"
              className="w-full bg-richblack-700 border border-richblack-600 rounded-xl px-4 py-3 text-sm text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-red-400/50 resize-none"
            />
            <p className="text-xs text-richblack-500 mt-1 text-right">{rejectReason.length}/500</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason("") }}
                className="flex-1 py-2.5 rounded-xl bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === `${rejectModal.id}-reject`}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading === `${rejectModal.id}-reject` ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
