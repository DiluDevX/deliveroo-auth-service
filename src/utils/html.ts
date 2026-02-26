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

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Escapes a URL to prevent JavaScript protocol injection and other XSS vectors.
 * Useful for href and src attributes.
 *
 * @param url - The URL to escape
 * @returns Escaped URL safe for use in HTML attributes
 */
export const escapeUrl = (url: string): string => {
  // Basic validation to prevent javascript: and data: protocols
  if (url.match(/^(javascript|data|vbscript):/i)) {
    return '';
  }

  // Escape HTML special characters in the URL
  return escapeHtml(url);
};
