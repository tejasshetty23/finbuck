/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['kick.com', 'files.kick.com'],
  },
  experimental: {
    // Loaded from node_modules at runtime instead of bundled. Bundling makes
    // webpack chase ws's optional native add-ons (bufferutil, utf-8-validate),
    // which ws itself only try-requires, and warn on every build.
    serverComponentsExternalPackages: ['ws'],
  },
}

module.exports = nextConfig
