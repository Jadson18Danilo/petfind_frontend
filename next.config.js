/** @type {import('next').NextConfig} */
function toRemotePattern(urlValue) {
  if (!urlValue) return null;

  try {
    const parsed = new URL(urlValue);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

const apiImagePatterns = [
  toRemotePattern(process.env.NEXT_PUBLIC_API_URL),
  toRemotePattern(process.env.NEXT_PUBLIC_API_FALLBACK_URL),
].filter(Boolean);

const externalImageHosts = (process.env.NEXT_PUBLIC_EXTERNAL_IMAGE_HOSTS || 'img.icons8.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)
  .map((hostname) => ({
    protocol: 'https',
    hostname,
    pathname: '/**',
  }));

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [...apiImagePatterns, ...externalImageHosts],
  },
}

module.exports = nextConfig