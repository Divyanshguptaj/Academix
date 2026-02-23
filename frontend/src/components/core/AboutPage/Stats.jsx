import { useEffect, useRef, useState } from "react";
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaTrophy } from "react-icons/fa";

const statsData = [
  { icon: FaUserGraduate,       numericValue: 5,   suffix: "K+", label: "Active Students", color: "text-blue-400"   },
  { icon: FaChalkboardTeacher,  numericValue: 10,  suffix: "+",  label: "Expert Mentors",  color: "text-yellow-400" },
  { icon: FaBook,               numericValue: 200, suffix: "+",  label: "Courses",         color: "text-green-400"  },
  { icon: FaTrophy,             numericValue: 50,  suffix: "+",  label: "Awards Won",      color: "text-purple-400" },
];

function StatCard({ icon: Icon, numericValue, suffix, label, color, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let frame;
    const duration = 1800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic — fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericValue));
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setCount(numericValue);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, numericValue]);

  return (
    <div className="flex flex-col items-center gap-3 py-10 px-4 bg-richblack-800 group cursor-default select-none">
      <div className={`${color} mb-1 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
        <Icon size={34} />
      </div>
      <div className={`text-4xl sm:text-5xl font-bold ${color} tabular-nums tracking-tight leading-none`}>
        {count}
        <span className="text-2xl sm:text-3xl font-semibold">{suffix}</span>
      </div>
      <p className="text-gray-400 text-xs sm:text-sm font-medium text-center uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

const StatsComponenet = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="border-y border-gray-700">
      {/* gap-px + bg-gray-700 on parent renders as 1-px dividers between cards */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-700">
          {statsData.map((stat, i) => (
            <StatCard key={i} {...stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsComponenet;