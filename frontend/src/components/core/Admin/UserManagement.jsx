import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"
import { FaSearch, FaTimes } from "react-icons/fa"
import RefreshButton from "../../common/RefreshButton"

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
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("firstName")
  const [sortOrder, setSortOrder] = useState("asc")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsersCount, setTotalUsersCount] = useState(0)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset page when role changes
  useEffect(() => {
    setPage(1)
  }, [roleFilter])

  useEffect(() => {
    if (adminUser?.accountType === "Admin") fetchUsers()
  }, [adminUser, page, debouncedSearch, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search: debouncedSearch,
        accountType: roleFilter,
      }).toString()

      const response = await apiConnector("GET", `${adminEndpoints.GET_ALL_USERS}?${queryParams}`)
      const { users, totalUsers, totalPages, currentPage } = response.data.data

      setUsers(users || [])
      setTotalUsersCount(totalUsers || 0)
      setTotalPages(totalPages || 1)
      setPage(currentPage || 1)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // Sort the current page on the frontend
  const sortedUsers = [...users].sort((a, b) => {
      let av = sortBy === "gender" ? a.additionalDetails?.gender : a[sortBy]
      let bv = sortBy === "gender" ? b.additionalDetails?.gender : b[sortBy]

      if (typeof av === "string" && typeof bv === "string") {
        return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (!av) return sortOrder === "asc" ? 1 : -1;
      if (!bv) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc" ? (av > bv ? 1 : -1) : (bv > av ? 1 : -1)
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">User Management</h1>
          <p className="text-sm text-richblack-400 mt-0.5">Manage all users across the platform</p>
        </div>
        <RefreshButton onClick={fetchUsers} loading={loading} />
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
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-sm text-richblack-200 focus:outline-none"
        >
          <option value="firstName">Name</option>
          <option value="email">Email</option>
          <option value="accountType">Role</option>
          <option value="gender">Gender</option>
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
                {["User", "Role", "Email", "Gender"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-richblack-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-richblack-600 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin" />
                      </div>
                    </div>
                  </td>
                </tr>
              ) : sortedUsers.map((u) => {
                const name = `${u.firstName} ${u.lastName}`
                const img = decodeImg(u.image)
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
                    <td className="px-5 py-3.5 text-sm text-richblack-400">{u.email}</td>
                    <td className="px-5 py-3.5 text-sm text-richblack-400">
                      {u.additionalDetails?.gender || "Not specified"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && sortedUsers.length === 0 && (
          <div className="text-center py-12 text-richblack-400 text-sm">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination & Result count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p className="text-xs text-richblack-500">
          Showing {sortedUsers.length} of {totalUsersCount} users
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
    </div>
  )
}
