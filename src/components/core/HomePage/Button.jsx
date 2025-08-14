import React from 'react';
import { Link } from 'react-router-dom';

function Button(props) {
  return (
    <Link to={props.link} className="block w-full sm:w-fit">
      <div 
        className={`mt-8 sm:mt-8 py-1 mx-2 sm:mx-5 rounded-md text-richblack-200 transition-all duration-200 hover:scale-95 w-full sm:w-fit ${
          props.color === 'yellow' 
            ? "bg-yellow-400 text-zinc-900 hover:bg-yellow-500" 
            : "bg-zinc-600 text-white hover:bg-zinc-700"
        }`}
      >
        <div className='flex items-center justify-center gap-2 rounded-full px-4 sm:px-10 py-[5px] transition-all duration-200 font-medium sm:font-semibold text-sm sm:text-base'>
          {props.text}
        </div>
      </div>
    </Link>
  );
}

export default Button;