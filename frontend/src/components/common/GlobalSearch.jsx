import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { apiConnector } from "../../services/apiconnector";
// You will need to add this endpoint to your apis.js:
// SEARCH_ALL_COURSES_API: BASE_URL + "/course/search-all-courses"

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search API Call
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await apiConnector("POST", "http://localhost:4000/api/v1/course/search-all-courses", { searchQuery: query });
        setResults(res.data.data || []);
      } catch (error) {
        console.error("Global search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectCourse = (courseId) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="relative w-full max-w-[250px] lg:max-w-[350px]" ref={searchRef}>
      <div className="relative flex items-center">
        <FaSearch className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search for anything..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full bg-richblack-800 border border-gray-700 text-white rounded-full py-2 pl-10 pr-4 outline-none focus:border-yellow-400 transition-all text-sm placeholder-gray-500"
        />
        {isSearching && (
          <div className="absolute right-3 w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-richblack-800 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {results.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleSelectCourse(course._id)}
                  className="flex items-center gap-3 p-3 hover:bg-richblack-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors"
                >
                  <img src={course.thumbnail} alt="thumbnail" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-white text-sm font-medium truncate">{course.courseName}</p>
                    <p className="text-gray-400 text-xs truncate">{course.category?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isSearching && (
              <div className="p-4 text-center text-sm text-gray-400">
                No courses found for "{query}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
