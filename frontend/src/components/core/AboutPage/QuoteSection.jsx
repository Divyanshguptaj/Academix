import Quote from "./Quote"

const QuoteSection = () => {
  return (
    <section className="border-b border-slate-600 mt-20 md:mt-0">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="h-[80px] md:h-[100px]"></div>
          <Quote />
        </div>
      </section>
  )
}

export default QuoteSection
