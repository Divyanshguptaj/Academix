import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import Course_Card from "../components/core/Catalog/Course_Card";
import Error from "./Error";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

/* ── Loading skeleton ── */
const CardSkeleton = () => (
  <div className="bg-[#1d1d1d] rounded-xl overflow-hidden border border-gray-800 animate-pulse">
    <div className="h-[200px] bg-gray-800" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-700 rounded w-1/3" />
    </div>
  </div>
);

/* ── Section heading ── */
const SectionHeading = ({ children }) => (
  <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-snug">
    {children}
  </h2>
);

/* ── Main page ── */
const Catalog = () => {
  const { catalogName } = useParams();
  const storeCategories = useSelector((state) => state.course.categories);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortTab, setSortTab] = useState(1);
  const [priceFilter, setPriceFilter] = useState("all");
  const coursesPerPage = 8;

  // Debounce the search input (waits 500ms after the user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, sortTab, priceFilter]);

  // Step 1 — resolve category name → id
  useEffect(() => {
    if (catalogName === "all") {
      setCategoryId("all");
      setNotFound(false);
      return;
    }

    // Wait for Redux to populate categories from the Navbar global fetch
    if (!storeCategories || storeCategories.length === 0) return;

    const match = storeCategories.find(
      (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
    );

    if (match) {
      setCategoryId(match._id);
      setNotFound(false);
    } else {
      setNotFound(true);
      setPageLoading(false);
    }
  }, [catalogName, storeCategories]);

  // Step 2 — fetch catalog page data
  useEffect(() => {
    let ignore = false; // Flag to prevent race conditions

    const getCategoryDetails = async () => {
      try {
        // Only show full-page skeleton on initial load, prevent flashing when searching
        if (!catalogPageData) setPageLoading(true);
        
        const res = await getCatalogPageData(categoryId, debouncedQuery, currentPage, coursesPerPage, sortTab, priceFilter);
        if (!ignore) {
          setCatalogPageData(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setPageLoading(false);
      }
    };
    if (categoryId) getCategoryDetails();

    return () => { ignore = true; }; // Cleanup on unmount or ID change
  }, [categoryId, debouncedQuery, currentPage, sortTab, priceFilter]);

  /* ── Loading state ── */
  if (pageLoading) {
    return (
      <div className="bg-[#121220] min-h-screen">
        {/* Hero skeleton */}
        <div className="bg-[#1d1d1d] pt-24 pb-12 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
            <div className="h-3 bg-gray-700 rounded w-40 mb-5" />
            <div className="h-9 bg-gray-700 rounded w-72 mb-4" />
            <div className="h-4 bg-gray-700 rounded w-full max-w-2xl mb-2" />
            <div className="h-4 bg-gray-700 rounded w-3/4 max-w-xl" />
          </div>
        </div>
        {/* Section skeleton */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="h-6 bg-gray-700 rounded w-56 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (notFound || !catalogPageData?.success) {
    return <Error />;
  }

  const { selectedCategory, mostSellingCourses } = catalogPageData.data;

  // Courses are now fully paginated and filtered directly by the backend!
  const currentCourses = selectedCategory?.courses ?? [];
  const totalPages = selectedCategory?.totalPages ?? 1;

  return (
    <div className="bg-[#121220] min-h-screen overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="bg-[#1d1d1d] pt-24 pb-12 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors duration-150">
              Home
            </Link>
            <span>/</span>
            <span>Catalog</span>
            <span>/</span>
            <span className="text-yellow-400 font-medium">
              {selectedCategory?.name}
            </span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {selectedCategory?.name}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            {selectedCategory?.description}
          </p>
        </div>
      </section>

      {/* ── Main Catalog Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── Left Sidebar Filters ── */}
          <div className="w-full lg:w-[260px] flex-shrink-0 bg-richblack-800 p-6 rounded-xl border border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Filters</h3>
            
            {/* Sort By Filter */}
            <div className="mb-8 border-b border-gray-700 pb-6">
              <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Sort By</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortTab === 1} 
                    onChange={() => setSortTab(1)}
                    className="w-4 h-4 text-yellow-400 bg-richblack-900 border-gray-600 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${sortTab === 1 ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>Most Popular</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortTab === 2} 
                    onChange={() => setSortTab(2)}
                    className="w-4 h-4 text-yellow-400 bg-richblack-900 border-gray-600 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${sortTab === 2 ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>Newest First</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Price</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="price" 
                    checked={priceFilter === "all"} 
                    onChange={() => setPriceFilter("all")}
                    className="w-4 h-4 text-yellow-400 bg-richblack-900 border-gray-600 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${priceFilter === "all" ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>All Courses</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="price" 
                    checked={priceFilter === "free"} 
                    onChange={() => setPriceFilter("free")}
                    className="w-4 h-4 text-yellow-400 bg-richblack-900 border-gray-600 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${priceFilter === "free" ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>Free</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="price" 
                    checked={priceFilter === "paid"} 
                    onChange={() => setPriceFilter("paid")}
                    className="w-4 h-4 text-yellow-400 bg-richblack-900 border-gray-600 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${priceFilter === "paid" ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'}`}>Paid</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Right Content Grid ── */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
              <SectionHeading>Available Courses</SectionHeading>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-500 text-sm" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-richblack-800 border border-gray-700 text-white text-sm rounded-full pl-10 pr-10 py-2.5 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all placeholder-gray-500 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {currentCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentCourses.map((course, i) => (
                    <Course_Card key={i} course={course} Height="h-[200px]" />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded bg-richblack-800 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition">Prev</button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${currentPage === idx + 1 ? 'bg-yellow-400 text-black font-bold' : 'bg-richblack-800 text-white hover:bg-richblack-700'}`}>
                        {idx + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded bg-richblack-800 text-white text-sm disabled:opacity-50 hover:bg-richblack-700 transition">Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-richblack-800 border border-gray-700 rounded-xl">
                <p className="text-gray-400">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-800 mx-4 sm:mx-6 lg:mx-12" />

      {/* ── Section 2: Frequently Bought ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8">
          <SectionHeading>Frequently Bought</SectionHeading>
          <p className="text-gray-400 text-sm mt-1.5">
            Most purchased courses by our learners.
          </p>
        </div>

        {mostSellingCourses?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mostSellingCourses.slice(0, 6).map((course, i) => (
              <Course_Card key={i} course={course} Height="h-[200px]" />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No frequently bought courses found.</p>
        )}
      </section>

    </div>
  );
};

export default Catalog;
