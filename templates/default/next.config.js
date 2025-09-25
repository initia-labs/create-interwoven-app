/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence workspace root detection warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig