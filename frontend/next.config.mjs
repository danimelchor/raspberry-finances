/** @type {import('next').NextConfig} */

if (process.env.API_URL == null) {
  throw new Error("API_URL environment variable is required");
}

const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_URL + "/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/finances",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
