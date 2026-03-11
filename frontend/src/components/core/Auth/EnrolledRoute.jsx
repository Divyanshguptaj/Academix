import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { apiConnector } from '../../../services/apiconnector'
import { profileEndpoints } from '../../../services/apis'
import { ACCOUNT_TYPE } from '../../../utils/constants'

const { GET_USER_ENROLLED_COURSES_API } = profileEndpoints

/**
 * Allows access to /view-course/:courseId only when:
 *   - User is logged in
 *   - User is enrolled in that specific course
 *     (Instructors and Admins bypass the enrollment check)
 *
 * Redirects to /courses/:courseId (public course page) if not enrolled.
 */
export default function EnrolledRoute({ children }) {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  // 'checking' | 'allowed' | 'denied'
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (!token || !user) {
      setStatus('denied')
      return
    }

    // Instructors and Admins can view any course without enrollment
    if (user.accountType !== ACCOUNT_TYPE.STUDENT) {
      setStatus('allowed')
      return
    }

    // For students, verify enrollment silently (no toast)
    const checkEnrollment = async () => {
      try {
        const response = await apiConnector(
          'GET',
          `${GET_USER_ENROLLED_COURSES_API}?userId=${user._id}`
        )
        const courses = response?.data?.data || []
        const isEnrolled = courses.some((c) => c._id === courseId)
        setStatus(isEnrolled ? 'allowed' : 'denied')
      } catch {
        setStatus('denied')
      }
    }

    checkEnrollment()
  }, [courseId, token, user])

  if (!token) return <Navigate to="/login" replace />

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121220]">
        <div className="spinner" />
      </div>
    )
  }

  if (status === 'denied') return <Navigate to={`/courses/${courseId}`} replace />

  return children
}
