import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { adminEndpoints } from "../../../services/apis"
import { FaUser, FaUserGraduate, FaUserTie, FaSearch, FaFilter, FaSort, FaEye, FaBan, FaCheckCircle } from "react-icons/fa"
import { format } from "date-fns"

export default function UserManagement() {
  const { user } = useSelector((state) => state.profile)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    if (user?.accountType === "Admin") {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiConnector("GET", adminEndpoints.GET_ALL_USERS)
      setUsers(response.data.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await apiConnector("PUT", adminEndpoints.UPDATE_USER_STATUS.replace(":id", userId), {
        status: newStatus
      })
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("Failed to update user status")
    }
  }

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === "all" || user.accountType === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortBy === "createdAt" || sortBy === "lastLogin") {
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
          onClick={fetchUsers}
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
          <h1 className="text-3xl font-bold text-richblack-50">User Management</h1>
          <p className="text-richblack-300 mt-1">Manage all users in the system</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUsers}
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Roles</option>
              <option value="Student">Students</option>
              <option value="Instructor">Instructors</option>
              <option value="Admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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
                <option value="firstName">Name</option>
                <option value="email">Email</option>
                <option value="accountType">Role</option>
                <option value="lastLogin">Last Login</option>
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

      {/* Users Table */}
      <div className="bg-richblack-700 rounded-lg border border-richblack-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-richblack-600 border-b border-richblack-500">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-600">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-richblack-600 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={user.image} alt={user.firstName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-richblack-50">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-richblack-400">
                          Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.accountType === "Admin" ? "bg-purple-100 text-purple-800" :
                      user.accountType === "Instructor" ? "bg-green-100 text-green-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {user.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                    {user.lastLogin ? format(new Date(user.lastLogin), "MMM dd, yyyy h:mm a") : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleUserStatusChange(user._id, user.status === "active" ? "suspended" : "active")}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        user.status === "active"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.status === "active" ? <FaBan className="mr-1" /> : <FaCheckCircle className="mr-1" />}
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-10 text-richblack-400">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-blue-400">{users.length}</p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === "active").length}</p>
        </div>
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <h3 className="text-lg font-semibold text-richblack-50 mb-2">Suspended Users</h3>
          <p className="text-2xl font-bold text-red-400">{users.filter(u => u.status === "suspended").length}</p>
        </div>
      </div>
    </div>
  )
}