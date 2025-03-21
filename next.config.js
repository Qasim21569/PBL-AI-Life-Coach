/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static exports for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/AI-Life-COach' : '', // Adjust base path for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
  // Preserve existing config settings if any
};

module.exports = nextConfig; 