import type { NextConfig } from "next";

const apiProxyTarget = process.env.FRONTEND_API_PROXY_TARGET ?? "http://localhost:8000/api/v1";

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: "standalone",
  experimental: {
    devtoolSegmentExplorer: false,
    browserDebugInfoInTerminal: false
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiProxyTarget}/:path*`
      }
    ];
  }
};

export default nextConfig;
