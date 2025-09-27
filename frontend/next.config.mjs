/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Fail build on ESLint errors in production
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Fail build on TS errors in production
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
