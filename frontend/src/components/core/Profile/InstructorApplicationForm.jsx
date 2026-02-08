import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiconnector"
import { authEndpoints } from "../../../services/apis"
import { FaGraduationCap, FaBriefcase, FaTags, FaPen, FaLink, FaUserPlus } from "react-icons/fa"

export default function InstructorApplicationForm() {
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    qualifications: "",
    experience: "",
    expertise: "",
    bio: "",
    portfolio: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiConnector("POST", authEndpoints.SUBMIT_INSTRUCTOR_APPLICATION, {
        ...formData,
        expertise: formData.expertise.split(',').map(item => item.trim())
      })

      if (response.data.success) {
        setSuccess(true)
        setFormData({
          qualifications: "",
          experience: "",
          expertise: "",
          bio: "",
          portfolio: ""
        })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setError(error.response?.data?.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  if (user?.accountType === "Instructor" || user?.accountType === "Admin") {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-richblack-200">Already an Instructor</h1>
        <p className="text-richblack-400 mt-2">You already have instructor privileges.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <FaUserPlus className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-richblack-50">Become an Instructor</h1>
            <p className="text-richblack-300">Share your knowledge and start teaching</p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        {success ? (
          <div className="text-center py-10">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Application Submitted!</strong>
              <span className="block sm:inline"> Thank you for your application. We'll review it and get back to you soon.</span>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-richblack-300 mb-2">
                <FaGraduationCap className="inline mr-2 text-blue-400" />
                Educational Qualifications
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-blue-500"
                placeholder="e.g., B.Tech in Computer Science, MBA, etc."
                required
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-richblack-300 mb-2">
                <FaBriefcase className="inline mr-2 text-green-400" />
                Professional Experience
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-green-500"
                placeholder="e.g., 5 years of experience in web development, worked at XYZ company, etc."
                required
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-richblack-300 mb-2">
                <FaTags className="inline mr-2 text-yellow-400" />
                Areas of Expertise
              </label>
              <input
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
                placeholder="e.g., Web Development, Data Science, Machine Learning, etc. (comma-separated)"
                required
              />
              <p className="text-xs text-richblack-400 mt-1">Enter multiple areas separated by commas</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-richblack-300 mb-2">
                <FaPen className="inline mr-2 text-purple-400" />
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-purple-500"
                placeholder="Tell us about your teaching philosophy, what makes you passionate about teaching, etc."
                required
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-richblack-300 mb-2">
                <FaLink className="inline mr-2 text-cyan-400" />
                Portfolio/Website (Optional)
              </label>
              <input
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                type="url"
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-cyan-500"
                placeholder="https://your-portfolio.com"
              />
              <p className="text-xs text-richblack-400 mt-1">Link to your portfolio, GitHub, or personal website</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
        <h3 className="text-lg font-semibold text-richblack-50 mb-4">Application Guidelines</h3>
        <ul className="space-y-2 text-richblack-300">
          <li>• Provide accurate and complete information</li>
          <li>• Highlight your relevant experience and qualifications</li>
          <li>• Be specific about your areas of expertise</li>
          <li>• Applications are typically reviewed within 3-5 business days</li>
          <li>• You will be notified via email regarding the status of your application</li>
        </ul>
      </div>
    </div>
  )
}