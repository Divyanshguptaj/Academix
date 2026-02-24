import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/core/Dashboard/Sidebar"
import Footer from "../components/common/Footer"

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

      {/* Spacer — same width as sidebar, keeps content shifted right */}
      <div className="w-[60px] lg:w-64 flex-shrink-0" />

      {/* Fixed sidebar — never scrolls, no gap at bottom */}
      <div className="fixed top-[3.5rem] left-0 w-[60px] lg:w-64 h-[calc(100vh-3.5rem)] z-40">
        <Sidebar />
      </div>

      {/* Content + Footer — fills remaining width */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* min-h ensures footer is below the fold (scroll to see it) */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </main>

        <Footer />

      </div>

    </div>
  )
}

export default Dashboard
