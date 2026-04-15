import api from './api';

function getApiBaseUrl() {
  const baseURL = (api?.defaults?.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/$/, '');
  return baseURL === '/api' ? '' : baseURL;
}

function toRelativeUploadsPath(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/api/uploads/')) {
    return trimmed.replace('/api/uploads/', '/uploads/');
  }

  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      if (isLocalHost && parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';

  const localRelativePath = toRelativeUploadsPath(trimmed);
  if (localRelativePath !== trimmed) {
    return localRelativePath;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${getApiBaseUrl()}${trimmed}`;
  }

  return trimmed;
}

export function resolveMediaList(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (typeof item === 'string') return resolveMediaUrl(item);
      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return { ...item, url: resolveMediaUrl(item.url) };
      }
      return item;
    })
    .filter(Boolean);
}
