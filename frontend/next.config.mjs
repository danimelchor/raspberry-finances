/** @type {import('next').NextConfig} */

const required = [process.env.API_URL, process.env.AUTH_URL];
required.forEach((env) => {
  if (env == null) {
    throw new Error(env + " environment variable is required");
  }
});

const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_URL + "/:path*",
      },
      {
        source: "/auth/:path*",
        destination: process.env.AUTH_URL + "/:path*",
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
