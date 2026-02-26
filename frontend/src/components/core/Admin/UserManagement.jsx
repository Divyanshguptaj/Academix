import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaUsers, FaUserGraduate, FaUserTie, FaShieldAlt, FaSearch, FaBan, FaCheckCircle, FaTimes } from "react-icons/fa"
import { format } from "date-fns"

const decodeImg = (url) =>
  url?.replace(/&#x2F;/gi, "/").replace(/&#x27;/gi, "'").replace(/&amp;/gi, "&") || ""

const ROLE_BADGE = {
  Admin: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  Instructor: "bg-green-500/15 text-green-300 border-green-500/20",
  Student: "bg-blue-500/15 text-blue-300 border-blue-500/20",
}

export default function UserManagement() {
  const { user: adminUser } = useSelector((state) => state.profile)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (adminUser?.accountType === "Admin") fetchUsers()
  }, [adminUser])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_ALL_USERS)
      setUsers(response.data.data || [])
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus, name) => {
    setActionLoading(userId)
    try {
      await apiConnector("PUT", adminEndpoints.UPDATE_USER_STATUS.replace(":id", userId), { status: newStatus })
      toast.success(`${name} ${newStatus === "active" ? "activated" : "suspended"}`)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user status")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users
    .filter((u) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.lastName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      const matchesRole = roleFilter === "all" || u.accountType === roleFilter
      const matchesStatus = statusFilter === "all" || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === "createdAt" || sortBy === "lastLogin") {
        return sortOrder === "asc"
          ? new Date(av || 0) - new Date(bv || 0)
          : new Date(bv || 0) - new Date(av || 0)
      }
      if (typeof av === "string") {
        return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortOrder === "asc" ? av - bv : bv - av
    })

  const statCards = [
    { label: "Total Users", value: users.length, icon: FaUsers, color: "blue" },
    { label: "Students", value: users.filter((u) => u.accountType === "Student").length, icon: FaUserGraduate, color: "blue" },
    { label: "Instructors", value: users.filter((u) => u.accountType === "Instructor").length, icon: FaUserTie, color: "purple" },
    { label: "Admins", value: users.filter((u) => u.accountType === "Admin").length, icon: FaShieldAlt, color: "yellow" },
    { label: "Active", value: users.filter((u) => u.status === "active").length, icon: FaCheckCircle, color: "green" },
    { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, icon: FaBan, color: "red" },
  ]

  const iconColorMap = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    green: "text-green-400 bg-green-500/10",
    red: "text-red-400 bg-red-500/10",
  }
  const valueColorMap = {
    blue: "text-blue-400", purple: "text-purple-400", yellow: "text-yellow-400",
    green: "text-green-400", red: "text-red-400",
  }

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
          <h1 className="text-2xl font-bold text-richblack-5">User Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Manage all users — activate or suspend accounts</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-richblack-800 border border-richblack-700 rounded-xl p-3 text-center">
            <div className={`w-8 h-8 rounded-lg ${iconColorMap[s.color]} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="text-sm" />
            </div>
            <p className={`text-lg font-bold ${valueColorMap[s.color]}`}>{s.value}</p>
            <p className="text-xs text-richblack-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email…"
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="Student">Students</option>
          <option value="Instructor">Instructors</option>
          <option value="Admin">Admins</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="createdAt">Joined Date</option>
          <option value="firstName">Name</option>
          <option value="email">Email</option>
          <option value="accountType">Role</option>
          <option value="lastLogin">Last Login</option>
        </select>

        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 hover:bg-richblack-600 transition-colors"
          title="Toggle sort direction"
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
                {["User", "Role", "Status", "Email", "Joined", "Last Login", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-richblack-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {filtered.map((u) => {
                const name = `${u.firstName} ${u.lastName}`
                const img = decodeImg(u.image)
                const isActing = actionLoading === u._id
                return (
                  <tr key={u._id} className="hover:bg-richblack-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={name}
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(name)}`
                          }}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-richblack-5">{name}</p>
                          <p className="text-xs text-richblack-500">ID: {u._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[u.accountType] || "bg-richblack-600 text-richblack-300 border-richblack-500"}`}>
                        {u.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        u.status === "active"
                          ? "bg-green-500/15 text-green-300 border-green-500/20"
                          : "bg-red-500/15 text-red-300 border-red-500/20"
                      }`}>
                        {u.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">{u.email}</td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">
                      {u.createdAt ? format(new Date(u.createdAt), "MMM dd, yyyy") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">
                      {u.lastLogin ? format(new Date(u.lastLogin), "MMM dd, h:mm a") : "Never"}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.accountType !== "Admin" && (
                        <button
                          onClick={() => handleStatusChange(u._id, u.status === "active" ? "suspended" : "active", name)}
                          disabled={isActing}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                            u.status === "active"
                              ? "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400"
                              : "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400"
                          }`}
                        >
                          {u.status === "active" ? <FaBan className="text-xs" /> : <FaCheckCircle className="text-xs" />}
                          {isActing ? "…" : u.status === "active" ? "Suspend" : "Activate"}
                        </button>
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
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-richblack-500 text-right">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  )
}
