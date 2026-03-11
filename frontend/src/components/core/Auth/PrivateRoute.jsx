import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

/**
 * Generic route guard.
 *
 * allowedRoles={[]}              → any logged-in user (default)
 * allowedRoles={['Admin']}       → only that role(s)
 *
 * Unauthenticated users are redirected to /login.
 * Wrong-role users are redirected to /dashboard/my-profile.
 */
export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.accountType))) {
    return <Navigate to="/dashboard/my-profile" replace />
  }

  return children
}
