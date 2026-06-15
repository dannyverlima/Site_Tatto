import DOMPurify from 'dompurify';

export const normalizeHtml = (value: string): string => {
  if (typeof window === 'undefined') return value;

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'],
    ALLOWED_ATTR: ['style', 'class'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
};
