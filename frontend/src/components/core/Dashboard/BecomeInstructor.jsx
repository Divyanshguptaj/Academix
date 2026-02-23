import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../services/apiconnector';
import { endpoints } from '../../../services/apis';
import {
  FaChalkboardTeacher,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaPlus,
  FaExternalLinkAlt,
} from 'react-icons/fa';

export default function BecomeInstructor() {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [formData, setFormData] = useState({
    qualifications: '',
    experience: '',
    bio: '',
    portfolio: '',
  });

  // Already an instructor / admin
  if (user?.accountType === 'Instructor' || user?.accountType === 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FaCheckCircle className="text-green-400 text-5xl" />
        <h2 className="text-2xl font-bold text-white">
          You already have instructor access
        </h2>
        <p className="text-gray-400 text-sm">
          Head to your instructor dashboard to create courses.
        </p>
        <button
          onClick={() => navigate('/dashboard/instructor')}
          className="mt-2 bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Go to Instructor Dashboard
        </button>
      </div>
    );
  }

  // Application submitted successfully
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center">
          <FaClock className="text-yellow-400 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-white">Application submitted!</h2>
        <p className="text-gray-400 text-sm max-w-md">
          Your instructor application is under review. An admin will approve or
          reject it shortly. You'll be able to start creating courses once
          approved.
        </p>
        <button
          onClick={() => navigate('/dashboard/my-profile')}
          className="mt-2 bg-[#1d1d1d] border border-gray-700 text-white font-medium px-6 py-2.5 rounded-lg hover:border-yellow-400 transition-colors"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addExpertise = () => {
    const tag = expertiseInput.trim();
    if (tag && !expertise.includes(tag)) {
      setExpertise((prev) => [...prev, tag]);
    }
    setExpertiseInput('');
  };

  const handleExpertiseKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addExpertise();
    }
  };

  const removeExpertise = (tag) =>
    setExpertise((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (expertise.length === 0) {
      toast.error('Add at least one area of expertise');
      return;
    }

    setLoading(true);
    try {
      const response = await apiConnector(
        'POST',
        endpoints.SUBMIT_INSTRUCTOR_APPLICATION,
        { ...formData, expertise }
      );
      if (response.data.success) {
        toast.success('Application submitted!');
        setSubmitted(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 lg:py-0 lg:px-0">
      {/* Header */}
      <div className="mb-8 sm:my-10">
        <div className="flex items-center gap-3 mb-2">
          <FaChalkboardTeacher className="text-yellow-400 text-2xl" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Become an Instructor
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Fill in the form below. An admin will review your application and
          grant instructor access if approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
        {/* Qualifications */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Qualifications <span className="text-pink-400">*</span>
          </label>
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. B.Tech in Computer Science, AWS Certified Solutions Architect..."
            className="form-style resize-none"
            required
          />
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Teaching / Professional Experience{' '}
            <span className="text-pink-400">*</span>
          </label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. 5 years as a software engineer at XYZ, taught 200+ students online..."
            className="form-style resize-none"
            required
          />
        </div>

        {/* Expertise tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Areas of Expertise <span className="text-pink-400">*</span>
          </label>
          <div className="form-style flex flex-wrap gap-2 min-h-[42px] cursor-text"
               onClick={() => document.getElementById('expertise-input').focus()}>
            {expertise.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeExpertise(tag); }}
                  className="hover:text-white"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
            <input
              id="expertise-input"
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyDown={handleExpertiseKeyDown}
              onBlur={addExpertise}
              placeholder={expertise.length === 0 ? 'Type a skill and press Enter…' : ''}
              className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
            />
          </div>
          <p className="text-xs text-gray-500">
            Press <kbd className="bg-gray-700 px-1 rounded text-gray-300">Enter</kbd> or{' '}
            <kbd className="bg-gray-700 px-1 rounded text-gray-300">,</kbd> after each skill
          </p>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Short Bio <span className="text-pink-400">*</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell students about yourself, what you teach, and why you're passionate about it..."
            className="form-style resize-none"
            required
          />
        </div>

        {/* Portfolio (optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Portfolio / LinkedIn / GitHub{' '}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://..."
              className="form-style pr-10"
            />
            <FaExternalLinkAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" />
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-gray-400">
          <FaClock className="text-blue-400 mt-0.5 flex-shrink-0" />
          <span>
            Applications are reviewed manually. You will gain instructor access once
            an admin approves your request.
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto self-start bg-yellow-400 text-black font-semibold px-8 py-2.5 rounded-lg hover:bg-yellow-300 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <FaPlus size={13} />
              Submit Application
            </>
          )}
        </button>
      </form>
    </div>
  );
}
