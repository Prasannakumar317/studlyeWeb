/**
 * Utility to resolve asset paths, preferring optimized (.webp) versions
 * in the 'images-optimized' directory if available.
 */
export const getAssetPath = (path: string): string => {
  if (!path) return '';

  // If path is external, return as is
  if (path.startsWith('http')) return path;

  // Check if it's in the images directory and needs optimization
  if (path.startsWith('/images/')) {
    const fileName = path.split('/').pop() || '';
    const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg)$/, '');
    
    // Attempt to point to optimized version
    // Note: This assumes optimized files are in /images-optimized/ and have .webp extension
    return `/images-optimized/${nameWithoutExt}.webp`;
  }

  return path;
};
