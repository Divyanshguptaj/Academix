import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiConnector } from "../services/apiconnector";
import { categories } from "../services/apis";
import { getCatalogPageData } from "../services/operations/pageAndComponentData";
import Course_Card from "../components/core/Catalog/Course_Card";
import CourseSlider from "../components/core/Catalog/CourseSlider";
import Error from "./Error";

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

const SliderSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
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
  const [active, setActive] = useState(1);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Step 1 — resolve category name → id
  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        const match = res?.data?.data?.find(
          (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        );
        if (match) {
          setCategoryId(match._id);
        } else {
          setNotFound(true);
          setPageLoading(false);
        }
      } catch {
        setNotFound(true);
        setPageLoading(false);
      }
    };
    getCategories();
  }, [catalogName]);

  // Step 2 — fetch catalog page data
  useEffect(() => {
    const getCategoryDetails = async () => {
      try {
        setPageLoading(true);
        const res = await getCatalogPageData(categoryId);
        setCatalogPageData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };
    if (categoryId) getCategoryDetails();
  }, [categoryId]);

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
          <SliderSkeleton />
        </div>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (notFound || !catalogPageData?.success) {
    return <Error />;
  }

  const { selectedCategory, differentCategory, mostSellingCourses } =
    catalogPageData.data;

  const activeCourses =
    active === 1
      ? selectedCategory?.courses ?? []
      : [...(selectedCategory?.courses ?? [])].reverse();

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

      {/* ── Section 1: Courses to get you started ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <SectionHeading>Courses to get you started</SectionHeading>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-800/60 border border-gray-700/60 rounded-full p-1 self-start sm:self-auto">
            <button
              onClick={() => setActive(1)}
              className={`text-sm rounded-full px-4 py-1.5 transition-all duration-200 whitespace-nowrap ${
                active === 1
                  ? "bg-[#1d1d1d] text-white border border-gray-700 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Most Popular
            </button>
            <button
              onClick={() => setActive(2)}
              className={`text-sm rounded-full px-4 py-1.5 transition-all duration-200 whitespace-nowrap ${
                active === 2
                  ? "bg-[#1d1d1d] text-white border border-gray-700 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {activeCourses.length > 0 ? (
          <CourseSlider Courses={activeCourses} />
        ) : (
          <p className="text-gray-400">No courses found in this category.</p>
        )}
      </section>

      <div className="border-t border-gray-800 mx-4 sm:mx-6 lg:mx-8" />

      {/* ── Section 2: Top courses in related category ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-8">
          <SectionHeading>
            Top courses in{" "}
            <span className="text-yellow-400">{differentCategory?.name}</span>
          </SectionHeading>
          <p className="text-gray-400 text-sm mt-1.5">
            Explore courses from a related category you might also enjoy.
          </p>
        </div>

        {differentCategory?.courses?.length > 0 ? (
          <CourseSlider Courses={differentCategory.courses} />
        ) : (
          <p className="text-gray-400">No courses available.</p>
        )}
      </section>

      <div className="border-t border-gray-800 mx-4 sm:mx-6 lg:mx-8" />

      {/* ── Section 3: Frequently Bought ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
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
