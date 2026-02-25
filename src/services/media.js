import api from './api';

function getApiBaseUrl() {
  return (api?.defaults?.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';

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
