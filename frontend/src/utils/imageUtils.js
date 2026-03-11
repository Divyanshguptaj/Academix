/**
 * Utility functions for handling user profile images
 */

/**
 * Decodes HTML entities in image URLs to fix Google profile picture display issues
 * @param {string} imageUrl - The image URL that may contain HTML entities
 * @returns {string} - The decoded image URL
 */
export const decodeImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // Use the browser's own HTML parser — handles every entity type including
  // &#x2F; &#47; &amp; &lt; &gt; &quot; &#x27; named entities, etc.
  try {
    const txt = document.createElement('textarea');
    txt.innerHTML = imageUrl;
    return txt.value || null;
  } catch {
    // Fallback (non-browser env): handle the most common case manually
    return imageUrl
      .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'") || null;
  }
};

/**
 * Gets the appropriate user image with fallback logic
 * @param {Object} user - User object containing image and name
 * @returns {string} - The final image URL
 */
export const getUserImage = (user) => {
  if (!user) return null;
  // If user has an image, decode any HTML entities
  if (user.image) {
    return decodeImageUrl(user.image);
  }
  
  // Fallback to DiceBear initials if no image
  if (user.firstName && user.lastName) {
    return `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
  }
  
  return null;
};

/**
 * Creates an image error handler for fallback to DiceBear
 * @param {Object} user - User object
 * @returns {Function} - Error handler function
 */
export const createImageErrorHandler = (user) => {
  return (e) => {
    e.target.onerror = null; // prevent infinite loop if fallback also fails
    e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
  };
};