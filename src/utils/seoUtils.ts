/**
 * Utility functions for SEO optimization
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export const createSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    // Ensure the slug is URL-safe
    .trim();
};

/**
 * Creates a full SEO-friendly URL for a PG
 * @param pgName The name of the PG
 * @param pgId The ID of the PG
 * @param includeBase Whether to include the base URL
 * @returns A complete SEO-friendly URL
 */
export const createPgUrl = (pgName: string, pgId: string, includeBase: boolean = false): string => {
  const slug = createSlug(pgName);
  const path = `/pg/${slug}/${pgId}`;
  
  if (includeBase) {
    // In production, you would use your actual domain
    return `https://shelterly.in${path}`;
  }
  
  return path;
};

/**
 * Extracts the PG ID from a URL path
 * @param path The URL path
 * @returns The extracted PG ID
 */
export const extractPgIdFromPath = (path: string): string | null => {
  // Match both old and new URL formats
  const newFormatMatch = path.match(/\/pg\/([^/]+)\/([^/]+)/);
  const oldFormatMatch = path.match(/\/pg-details\/([^/]+)/);
  
  if (newFormatMatch && newFormatMatch[2]) {
    return newFormatMatch[2]; // Return the ID from the new format
  } else if (oldFormatMatch && oldFormatMatch[1]) {
    return oldFormatMatch[1]; // Return the ID from the old format
  }
  
  return null;
};
