import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromCart } from "../slices/cartSlice";
import { buyCourse } from "../services/operations/studentFeatureAPI";
import { RiDeleteBin6Line } from "react-icons/ri";
import RatingStars from "../components/common/RatingStars";
import GetAvgRating from "../utils/avgRating";

export default function Cart() {
  const { total, totalItems, cart } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyCourse = () => {
    const courses = cart.map((course) => course._id);
    buyCourse(token, courses, user, navigate, dispatch);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-3.5rem)]">
      <h1 className="mb-8 text-3xl font-medium text-richblack-5">Your Cart</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} Courses in Cart
      </p>

      {totalItems > 0 ? (
        <div className="mt-8 flex flex-col-reverse items-start gap-x-10 gap-y-6 lg:flex-row">
          
          {/* ── Cart Items List ── */}
          <div className="flex flex-1 flex-col">
            {cart.map((course, indx) => {
              const avgReviewCount = GetAvgRating(course?.ratingAndReviews);
              return (
                <div
                  key={course._id}
                  className={`flex w-full flex-wrap items-start justify-between gap-6 ${
                    indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
                  } ${indx !== 0 && "mt-6"}`}
                >
                  <div className="flex flex-1 flex-col gap-4 xl:flex-row">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-[148px] w-[220px] rounded-lg object-cover border border-richblack-700"
                    />
                    <div className="flex flex-col space-y-1">
                      <p className="text-lg font-semibold text-richblack-5">
                        {course?.courseName}
                      </p>
                      <p className="text-sm text-richblack-300">
                        {course?.category?.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-yellow-400 font-bold">
                          {avgReviewCount}
                        </span>
                        <RatingStars
                          Review_Count={avgReviewCount}
                          Star_Size={18}
                        />
                        <span className="text-richblack-400 text-sm">
                          ({course?.ratingAndReviews?.length || 0} Ratings)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <p className="text-2xl font-bold text-yellow-400">
                      ₹ {course?.price}
                    </p>
                    <button
                      onClick={() => dispatch(removeFromCart(course._id))}
                      className="flex items-center gap-x-2 rounded-md border border-richblack-600 bg-richblack-700 py-2.5 px-4 text-pink-200 hover:bg-richblack-600 hover:border-pink-200 hover:text-pink-100 transition-colors"
                    >
                      <RiDeleteBin6Line />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="w-full lg:w-[280px] flex-shrink-0 rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-lg sticky top-24">
            <p className="mb-2 text-sm font-medium text-richblack-300 uppercase tracking-wider">
              Total Amount
            </p>
            <p className="mb-6 text-3xl font-bold text-yellow-400">₹ {total}</p>
            <button
              onClick={handleBuyCourse}
              className="w-full rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-yellow-300 hover:scale-[0.98] shadow-md"
            >
              Checkout Now
            </button>
          </div>

        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold text-richblack-100 mb-4">Your cart is empty</p>
          <p className="text-richblack-400 mb-8">Looks like you haven't added any courses yet.</p>
          <button 
            onClick={() => navigate('/catalog/all')}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
}
                    indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"
                  } ${indx !== 0 && "mt-6"}`}
                >
                  <div className="flex flex-1 flex-col gap-4 xl:flex-row">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-[148px] w-[220px] rounded-lg object-cover border border-richblack-700"
                    />
                    <div className="flex flex-col space-y-1">
                      <p className="text-lg font-semibold text-richblack-5">
                        {course?.courseName}
                      </p>
                      <p className="text-sm text-richblack-300">
                        {course?.category?.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-yellow-400 font-bold">
                          {avgReviewCount}
                        </span>
                        <RatingStars
                          Review_Count={avgReviewCount}
                          Star_Size={18}
                        />
                        <span className="text-richblack-400 text-sm">
                          ({course?.ratingAndReviews?.length || 0} Ratings)
                        </span>
                      </div>
                    </div>
                  </div>

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4"
            >
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <h2 className="text-xl font-semibold mt-3">{course.name}</h2>
              <p className="text-gray-400 text-sm mt-2">{course.description}</p>
              <p className="text-yellow-400 text-lg font-bold mt-2">
                ₹{course.price}
              </p>
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                Buy Now
              </button>
            </div>
          ))
        ) : (
          <p className="text-center col-span-3 text-gray-400">No courses in cart</p>
        )}
      </div>
    </div>
  );
};

export default CartPage;
