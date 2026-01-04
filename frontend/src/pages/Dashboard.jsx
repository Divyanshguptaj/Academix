import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/core/Dashboard/Sidebar"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Sidebar fixed on left */}
      <div className="w-[60px] lg:w-64 fixed top-[3.5rem] left-0 h-[calc(100vh-3.5rem)] bg-richblack-800">
        <Sidebar />
      </div>

      {/* Main content shifts right depending on sidebar width */}
      <div className="flex-1 ml-[60px] lg:ml-64">
        <div className="mx-auto w-11/12 max-w-[1000px] py-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
