import { FaSyncAlt } from "react-icons/fa";

export default function RefreshButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 text-richblack-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      title="Refresh data"
    >
      <FaSyncAlt className={`text-xs ${loading ? "animate-spin text-yellow-400" : "text-richblack-300"}`} />
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}