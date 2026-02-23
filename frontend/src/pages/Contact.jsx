import ContactDetails from "../components/ContactPage/ContactDetails";
import ContactForm from "../components/ContactPage/ContactForm";
import ReviewSlider from "../components/common/ReviewSlider";

const Contact = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="bg-[#121220] pt-28 pb-16 lg:pb-20 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-semibold uppercase tracking-widest">
            Contact
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            We'd love to hear{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              from you
            </span>
          </h1>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Whether you have a question about courses, pricing, features, or
            anything else — our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Main content — details + form */}
      <section className="bg-[#121220] py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            {/* Left — contact info */}
            <div className="w-full lg:w-[38%] lg:sticky lg:top-28">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Contact information
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Reach us through any of these channels.
                </p>
              </div>
              <ContactDetails />
            </div>

            {/* Right — form */}
            <div className="w-full lg:w-[62%]">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewSlider />
    </div>
  );
};

export default Contact;
