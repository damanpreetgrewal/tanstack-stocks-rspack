/**
 * Generate initials from a user's name
 * @param name - User's full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  // Return first letter of first and last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get avatar color based on name for consistent coloring
 */
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return "bg-gray-500";
  
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ];
  
  const hash = name.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
}
