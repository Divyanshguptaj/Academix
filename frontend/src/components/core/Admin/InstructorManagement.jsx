import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import {
  FaUserTie, FaCheckCircle, FaTimesCircle, FaUsers, FaBook,
  FaRupeeSign, FaClock, FaSearch, FaSync, FaCalendar, FaEnvelope,
  FaExternalLinkAlt, FaTags, FaTimes
} from "react-icons/fa"
import { format } from "date-fns"
import ConfirmationModal from "../../common/ConfirmationModal"

const decodeImg = (url) =>
  url?.replace(/&#x2F;/gi, "/").replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&") || ""

export default function InstructorManagement() {
  const { user } = useSelector((state) => state.profile)
  const [instructors, setInstructors] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("applications")
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [rejectModal, setRejectModal] = useState(null) // { id, name }
  const [rejectReason, setRejectReason] = useState("")
  const [revokeModal, setRevokeModal] = useState(null) // { id, name }
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user?.accountType === "Admin") fetchInstructorData()
  }, [user, activeTab])

  const fetchInstructorData = async () => {
    try {
      setRefreshing(true)
      if (activeTab === "applications") {
        const res = await apiConnector("GET", adminEndpoints.GET_INSTRUCTOR_APPLICATIONS)
        setApplications(res.data.data || [])
      } else {
        const res = await apiConnector("GET", adminEndpoints.GET_ALL_INSTRUCTORS)
        setInstructors(res.data.data || [])
      }
    } catch {
      toast.error("Failed to load instructor data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (applicationId, name) => {
    setActionLoading(applicationId)
    try {
      await apiConnector("PUT", adminEndpoints.APPROVE_INSTRUCTOR_APPLICATION.replace(":id", applicationId), {})
      toast.success(`${name} approved as instructor`)
      fetchInstructorData()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve application")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal.id)
    try {
      await apiConnector("PUT", adminEndpoints.REJECT_INSTRUCTOR_APPLICATION.replace(":id", rejectModal.id), {
        rejectionReason: rejectReason.trim() || undefined,
      })
      toast.success(`Application from ${rejectModal.name} rejected`)
      setRejectModal(null)
      setRejectReason("")
      fetchInstructorData()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject application")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRevoke = async () => {
    if (!revokeModal) return
    setActionLoading(revokeModal.id)
    try {
      await apiConnector("PUT", adminEndpoints.REVOKE_INSTRUCTOR.replace(":id", revokeModal.id), {})
      toast.success(`Instructor access revoked for ${revokeModal.name}`)
      setRevokeModal(null)
      fetchInstructorData()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to revoke access")
    } finally {
      setActionLoading(null)
    }
  }

  // Applications use app.userId for user info, app.* for application fields
  const filteredApplications = applications.filter((app) => {
    const firstName = (app.userId?.firstName || "").toLowerCase()
    const lastName = (app.userId?.lastName || "").toLowerCase()
    const email = (app.userId?.email || "").toLowerCase()
    const q = searchTerm.toLowerCase()
    return firstName.includes(q) || lastName.includes(q) || email.includes(q)
  })

  const filteredInstructors = instructors.filter((instr) => {
    const q = searchTerm.toLowerCase()
    return (
      (instr.firstName || "").toLowerCase().includes(q) ||
      (instr.lastName || "").toLowerCase().includes(q) ||
      (instr.email || "").toLowerCase().includes(q)
    )
  })

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
          <h1 className="text-2xl font-bold text-richblack-5">Instructor Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Review applications and manage approved instructors</p>
        </div>
        <button
          onClick={fetchInstructorData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-richblack-800 border border-richblack-700 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "applications"
              ? "bg-richblack-700 text-richblack-5 shadow"
              : "text-richblack-400 hover:text-richblack-200"
          }`}
        >
          <FaClock className={activeTab === "applications" ? "text-orange-400" : ""} />
          Pending Applications
          {applications.length > 0 && (
            <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "approved"
              ? "bg-richblack-700 text-richblack-5 shadow"
              : "text-richblack-400 hover:text-richblack-200"
          }`}
        >
          <FaUsers className={activeTab === "approved" ? "text-green-400" : ""} />
          Approved Instructors
          {instructors.length > 0 && (
            <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-0.5 rounded-full">
              {instructors.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
        <input
          type="text"
          placeholder={`Search ${activeTab === "applications" ? "applicants" : "instructors"} by name or email…`}
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

      {/* === APPLICATIONS TAB === */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-richblack-800 border border-richblack-700 rounded-xl">
              <div className="w-16 h-16 mx-auto bg-richblack-700 rounded-full flex items-center justify-center mb-4">
                <FaClock className="text-2xl text-richblack-400" />
              </div>
              <p className="text-richblack-300 font-medium">
                {searchTerm ? "No applications match your search" : "No pending applications"}
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const name = `${app.userId?.firstName || ""} ${app.userId?.lastName || ""}`.trim() || "Unknown"
              const email = app.userId?.email || ""
              const img = decodeImg(app.userId?.image)
              const isActing = actionLoading === app._id
              return (
                <div key={app._id} className="bg-richblack-800 border border-richblack-700 rounded-xl overflow-hidden">
                  {/* Top: avatar + name + actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={img}
                          alt={name}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(name)}`
                          }}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-richblack-600"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <FaClock className="text-[9px] text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-richblack-5">{name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-richblack-400 mt-0.5">
                          <FaEnvelope className="text-xs" />
                          <span>{email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-richblack-500 mt-0.5">
                          <FaCalendar className="text-xs" />
                          <span>Applied {format(new Date(app.createdAt), "MMM dd, yyyy")}</span>
                          {app.submissionCount > 1 && (
                            <span className="text-orange-400 ml-1">· Attempt {app.submissionCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleApprove(app._id, name)}
                        disabled={isActing}
                        className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <FaCheckCircle />
                        {isActing ? "Approving…" : "Approve"}
                      </button>
                      <button
                        onClick={() => { setRejectModal({ id: app._id, name }); setRejectReason("") }}
                        disabled={isActing}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <FaTimesCircle />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Application details */}
                  <div className="border-t border-richblack-700 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {app.expertise?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <FaTags /> Areas of Expertise
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.expertise.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 px-2.5 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {app.qualifications && (
                      <div>
                        <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-1.5">Qualifications</p>
                        <p className="text-sm text-richblack-300 leading-relaxed">{app.qualifications}</p>
                      </div>
                    )}
                    {app.experience && (
                      <div>
                        <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-1.5">Experience</p>
                        <p className="text-sm text-richblack-300 leading-relaxed">{app.experience}</p>
                      </div>
                    )}
                    {app.bio && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-1.5">Bio</p>
                        <p className="text-sm text-richblack-300 leading-relaxed">{app.bio}</p>
                      </div>
                    )}
                    {app.portfolio && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-richblack-400 uppercase tracking-wide mb-1.5">Portfolio</p>
                        <a
                          href={app.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          {app.portfolio}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* === APPROVED INSTRUCTORS TAB === */}
      {activeTab === "approved" && (
        <div className="space-y-4">
          {/* Summary bar */}
          {instructors.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Instructors", value: instructors.length, color: "text-green-400" },
                { label: "Total Courses", value: instructors.reduce((s, i) => s + (i.courseCount || 0), 0), color: "text-blue-400" },
                { label: "Total Revenue", value: `₹${instructors.reduce((s, i) => s + (i.totalRevenue || 0), 0).toLocaleString("en-IN")}`, color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-richblack-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {filteredInstructors.length === 0 ? (
            <div className="text-center py-16 bg-richblack-800 border border-richblack-700 rounded-xl">
              <div className="w-16 h-16 mx-auto bg-richblack-700 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-2xl text-richblack-400" />
              </div>
              <p className="text-richblack-300 font-medium">
                {searchTerm ? "No instructors match your search" : "No approved instructors yet"}
              </p>
            </div>
          ) : (
            filteredInstructors.map((instr) => {
              const name = `${instr.firstName || ""} ${instr.lastName || ""}`.trim()
              const img = decodeImg(instr.image)
              const isActing = actionLoading === instr._id
              return (
                <div key={instr._id} className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={img}
                        alt={name}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(name)}`
                        }}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-richblack-600"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-[9px] text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-richblack-5">{name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-richblack-400 mt-0.5">
                        <FaEnvelope className="text-xs" />
                        <span>{instr.email}</span>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-richblack-400">
                          <FaBook className="text-blue-400" />
                          <span className="text-richblack-200 font-medium">{instr.courseCount ?? 0}</span> courses
                        </span>
                        <span className="flex items-center gap-1 text-xs text-richblack-400">
                          <FaUsers className="text-green-400" />
                          <span className="text-richblack-200 font-medium">{instr.studentCount ?? 0}</span> students
                        </span>
                        <span className="flex items-center gap-1 text-xs text-richblack-400">
                          <FaRupeeSign className="text-yellow-400" />
                          <span className="text-richblack-200 font-medium">₹{(instr.totalRevenue ?? 0).toLocaleString("en-IN")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setRevokeModal({ id: instr._id, name })}
                    disabled={isActing}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <FaTimesCircle />
                    {isActing ? "Revoking…" : "Revoke Access"}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* === REVOKE CONFIRMATION MODAL === */}
      {revokeModal && (
        <ConfirmationModal
          modalData={{
            text1: "Revoke Instructor Access?",
            text2: `This will downgrade ${revokeModal.name} to a Student account. Their existing courses will remain published but they won't be able to create new ones. They will be notified by email and can re-apply later.`,
            btn1Text: actionLoading === revokeModal.id ? "Revoking…" : "Confirm Revoke",
            btn1Handler: handleRevoke,
            btn2Text: "Cancel",
            btn2Handler: () => setRevokeModal(null),
          }}
        />
      )}

      {/* === REJECT MODAL === */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <FaTimesCircle className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-richblack-5">Reject Application</h3>
                <p className="text-sm text-richblack-400">{rejectModal.name}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-richblack-300 mb-2">
              Rejection Reason <span className="text-richblack-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why the application is being rejected…"
              rows={4}
              className="w-full bg-richblack-700 border border-richblack-600 rounded-xl px-4 py-3 text-sm text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-red-400/50 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason("") }}
                className="flex-1 py-2.5 rounded-xl bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectModal.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal.id ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
