/**
 * Escapes HTML special characters to prevent XSS vulnerabilities.
 * This is essential when interpolating user-provided or config values into HTML.
 *
 * @param text - The text to escape
 * @returns Escaped HTML string safe for interpolation
 */
export const escapeHtml = (text: string): string => {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replaceAll(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Validates that a URL is safe and uses an allowed protocol.
 * Uses a whitelist approach to only allow safe protocols.
 */
const isValidProtocol = (url: string): boolean => {
  // Trim whitespace from start and end
  const trimmedUrl = url.trim();

  // Check for empty URL
  if (!trimmedUrl) {
    return false;
  }

  // Whitelist of allowed URL patterns
  // 1. http:// or https://
  // 2. // (protocol-relative URLs)
  // 3. / or ./ or ../ (relative paths)
  // 4. mailto: (for email links)
  const allowedPatterns = [
    /^https?:\/\//i, // http:// or https://
    /^\/\//i, // protocol-relative //
    /^\//, // absolute path /
    /^\.\.?\//, // relative path ./ or ../
    /^mailto:/i, // mailto: links
  ];

  // Check if URL matches any allowed pattern
  const isAllowed = allowedPatterns.some((pattern) => pattern.test(trimmedUrl));

  if (isAllowed) {
    // Additional validation using URL constructor for http/https
    if (/^https?:\/\//i.test(trimmedUrl)) {
      try {
        new URL(trimmedUrl);
        return true;
      } catch {
        // Invalid URL format
        return false;
      }
    }
    return true;
  }

  return false;
};

/**
 * Escapes a URL to prevent JavaScript protocol injection and other XSS vectors.
 * Useful for href and src attributes.
 *
 * Uses a whitelist approach to validate protocols before escaping.
 * Blocks dangerous protocols like javascript:, data:, vbscript:, etc.
 *
 * @param url - The URL to escape
 * @returns Escaped URL safe for use in HTML attributes, or empty string if invalid
 */
export const escapeUrl = (url: string): string => {
  // Validate that the URL uses an allowed protocol
  if (!isValidProtocol(url)) {
    return '';
  }

  // Trim whitespace for consistency
  const trimmedUrl = url.trim();

  // Escape HTML special characters in the URL
  return escapeHtml(trimmedUrl);
};
