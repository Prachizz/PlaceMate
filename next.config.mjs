/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_NAME: "PlaceMate",
    NEXT_PUBLIC_APP_VERSION: "1.0.0"
  }
};

export default nextConfig;
