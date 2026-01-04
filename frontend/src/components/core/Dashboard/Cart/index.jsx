import { useSelector } from "react-redux"
import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 sm:mb-14 text-2xl sm:text-3xl font-medium text-richblack-300">
        Cart
      </h1>
      <p className="border-b border-b-slate-400 pb-2 font-semibold text-richblack-300 text-sm sm:text-base">
        {totalItems} Course{totalItems !== 1 ? 's' : ''} in Cart
      </p>
      {total > 0 ? (
        <div className="mt-6 sm:mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-x-10">
          <div className="flex-1 order-2 lg:order-1">
            <RenderCartCourses />
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-6">
            <RenderTotalAmount />
          </div>
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-xl sm:text-2xl lg:text-3xl text-richblack-300">
            Your cart is empty
          </p>
        </div>
      )}
    </div>
  )
}