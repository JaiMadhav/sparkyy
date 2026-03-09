export const formatLocation = (location: string): string => {
  if (!location) return "Unknown Location";
  
  // Check if it's a coordinate string (e.g. "28.6139, 77.2090")
  const coordRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
  if (coordRegex.test(location.trim())) {
    return "Custom Location";
  }
  
  // If it's a long Nominatim address, take the first few parts
  // e.g. "India Gate, Rajpath, Central Secretariat, New Delhi, Delhi, 110001, India"
  const parts = location.split(',').map(p => p.trim());
  if (parts.length > 3) {
    // Return first 2 parts for a concise "alphabet location"
    return parts.slice(0, 2).join(', ');
  }
  
  return location;
};
