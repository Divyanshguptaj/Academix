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
  
  // Replace HTML entities with their actual characters
  return imageUrl
    .replace(/&#x2F;/g, '/')  // Replace &#x2F; with /
    .replace(/&/g, '&')   // Replace & with &
    .replace(/</g, '<')    // Replace < with <
    .replace(/>/g, '>')    // Replace > with >
    .replace(/"/g, '"')  // Replace " with "
    .replace(/&#x27;/g, "'")  // Replace &#x27; with '
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
    // Fallback to DiceBear if Google image fails to load
    e.target.src = `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
  };
};