import { useState, useMemo } from "react"
import { Chart, registerables } from "chart.js"
import { Doughnut } from "react-chartjs-2"

Chart.register(...registerables)

const PALETTE = [
  "rgba(251,191,36,0.85)",
  "rgba(96,165,250,0.85)",
  "rgba(52,211,153,0.85)",
  "rgba(167,139,250,0.85)",
  "rgba(251,146,60,0.85)",
  "rgba(248,113,113,0.85)",
  "rgba(34,211,238,0.85)",
  "rgba(163,230,53,0.85)",
]

const PALETTE_BORDER = [
  "rgba(251,191,36,1)",
  "rgba(96,165,250,1)",
  "rgba(52,211,153,1)",
  "rgba(167,139,250,1)",
  "rgba(251,146,60,1)",
  "rgba(248,113,113,1)",
  "rgba(34,211,238,1)",
  "rgba(163,230,53,1)",
]

const truncate = (str, n = 22) => str.length > n ? str.slice(0, n) + "…" : str

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")

  const colors = useMemo(
    () => courses.map((_, i) => PALETTE[i % PALETTE.length]),
    [courses.length]
  )
  const borderColors = useMemo(
    () => courses.map((_, i) => PALETTE_BORDER[i % PALETTE_BORDER.length]),
    [courses.length]
  )

  const studentData = useMemo(() => ({
    labels: courses.map((c) => truncate(c.courseName)),
    datasets: [{
      data: courses.map((c) => c.studentsEnrolled?.length || 0),
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }), [courses, colors, borderColors])

  const incomeData = useMemo(() => ({
    labels: courses.map((c) => truncate(c.courseName)),
    datasets: [{
      data: courses.map((c) => (c.price || 0) * (c.studentsEnrolled?.length || 0)),
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }), [courses, colors, borderColors])

  const options = {
    cutout: "62%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9AA0B4",
          font: { size: 11 },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "#161D29",
        borderColor: "#2C333F",
        borderWidth: 1,
        titleColor: "#F1F2FF",
        bodyColor: "#999DAA",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) =>
            currChart === "income"
              ? ` ₹${ctx.raw.toLocaleString("en-IN")}`
              : ` ${ctx.raw} student${ctx.raw !== 1 ? "s" : ""}`,
        },
      },
    },
  }

  const activeData = currChart === "students" ? studentData : incomeData

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-richblack-800 border border-richblack-700 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-richblack-300 uppercase tracking-wide">Visualize</p>
        <div className="flex items-center gap-1 bg-richblack-700 rounded-lg p-1">
          {["students", "income"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrChart(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize ${
                currChart === tab
                  ? "bg-yellow-400 text-richblack-900"
                  : "text-richblack-300 hover:text-richblack-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
        <div style={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
          <Doughnut data={activeData} options={options} />
        </div>
      </div>
    </div>
  )
}
