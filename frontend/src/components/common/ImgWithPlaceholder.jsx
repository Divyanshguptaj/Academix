import React, { useState } from 'react';

const ImgWithPlaceholder = ({ src, alt, className, containerClassName, isVideo, ...rest }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-richblack-800 ${containerClassName || ''}`}>
      
      {/* 1. Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-richblack-700 animate-pulse">
          {/* Optional: You can put a loading spinner icon here */}
        </div>
      )}

      {/* 2. Error Fallback (If the image link is broken) */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-richblack-700">
          <span className="text-richblack-300 text-xs text-center px-2">
            Media unavailable
          </span>
        </div>
      )}

      {/* 3. The Actual Image or Video */}
      {!hasError && (
        isVideo ? (
          <video
            src={src}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className || ''}`}
            onCanPlay={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            {...rest}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className || ''}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            {...rest}
          />
        )
      )}
    </div>
  );
};

export default ImgWithPlaceholder;