import { FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm";
import CourseInformationForm from "./CourseInformation/CourseInformationForm";
import PublishCourse from "./PublishCourse";
import React from "react";

export default function RenderSteps() {
  const { step } = useSelector((state) => state.course);

  const steps = [
    { id: 1, title: "Course Information", shortTitle: "Info" },
    { id: 2, title: "Course Builder", shortTitle: "Builder" },
    { id: 3, title: "Publish", shortTitle: "Publish" },
  ];

  return (
    <>
      {/* Step Progress Indicator */}
      <div className="w-full mb-8 sm:mb-12">
        {/* Mobile Layout (Vertical) */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {steps.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                {/* Step Circle */}
                <div
                  className={`flex-shrink-0 grid aspect-square w-8 h-8 place-items-center rounded-full border-2 text-sm font-medium ${
                    step === item.id
                      ? "border-yellow-400 bg-yellow-900 text-yellow-50"
                      : step > item.id
                      ? "border-yellow-500 bg-yellow-500 text-richblack-900"
                      : "border-richblack-600 bg-richblack-800 text-richblack-300"
                  }`}
                >
                  {step > item.id ? (
                    <FaCheck className="text-xs" />
                  ) : (
                    item.id
                  )}
                </div>

                {/* Step Title and Status */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-base font-medium ${
                      step >= item.id ? "text-yellow-300" : "text-white/50"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {step > item.id 
                      ? "Completed" 
                      : step === item.id 
                      ? "In Progress" 
                      : "Pending"}
                  </p>
                </div>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-4 bg-richblack-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop/Tablet Layout (Horizontal) */}
        <div className="hidden sm:block">
          {/* Step Circles and Connectors */}
          <div className="relative mb-4 flex w-full items-center justify-between">
            {steps.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* Step Circle */}
                <div className="flex flex-col items-center z-10">
                  <div
                    className={`grid aspect-square w-10 h-10 lg:w-12 lg:h-12 place-items-center rounded-full border-2 text-sm lg:text-base font-medium transition-all duration-200 ${
                      step === item.id
                        ? "border-yellow-400 bg-yellow-900 text-yellow-50 scale-110"
                        : step > item.id
                        ? "border-yellow-500 bg-yellow-500 text-richblack-900"
                        : "border-richblack-600 bg-richblack-800 text-richblack-300"
                    }`}
                  >
                    {step > item.id ? (
                      <FaCheck className="text-sm lg:text-base" />
                    ) : (
                      item.id
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-0.5 lg:h-1 rounded transition-all duration-300 ${
                        step > item.id + 1 || (step > item.id && step >= item.id + 1)
                          ? "bg-yellow-500"
                          : "bg-richblack-600"
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex w-full justify-between px-2">
            {steps.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center min-w-0">
                {/* Full title on larger screens, short title on medium */}
                <p
                  className={`text-sm lg:text-base font-medium transition-colors duration-200 ${
                    step >= item.id ? "text-yellow-300" : "text-richblack-300"
                  }`}
                >
                  <span className="hidden lg:inline">{item.title}</span>
                  <span className="lg:hidden">{item.shortTitle}</span>
                </p>
                
                {/* Progress Status */}
                <p
                  className={`text-xs mt-1 ${
                    step > item.id
                      ? "text-green-400"
                      : step === item.id
                      ? "text-yellow-400"
                      : "text-white/50"
                  }`}
                >
                  {step > item.id 
                    ? "Complete" 
                    : step === item.id 
                    ? "Current" 
                    : "Pending"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-6">
          <div className="w-full bg-richblack-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-richblack-300 mt-2 text-center">
            Step {step} of {steps.length}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="w-full">
        {step === 1 && (
          <div className="animate-fadeIn">
            <CourseInformationForm />
          </div>
        )}
        {step === 2 && (
          <div className="animate-fadeIn">
            <CourseBuilderForm />
          </div>
        )}
        {step === 3 && (
          <div className="animate-fadeIn">
            <PublishCourse />
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}