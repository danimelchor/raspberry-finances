/** @type {import('next').NextConfig} */
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
