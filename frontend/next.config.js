/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
    ];
  },
  // Ajoutez cette configuration pour gérer les paramètres d'URL
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
