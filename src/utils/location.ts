export const formatLocation = (location: string): string => {
  if (!location) return "Unknown Location";
  
  // Check if it's a coordinate string (e.g. "28.6139, 77.2090")
  const coordRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
  if (coordRegex.test(location.trim())) {
    return "Custom Location";
  }
  
  return location;
};
