const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables ESLint in production builds
  },
  
  webpack(config: any) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // protect all pages except static/api files
  ],
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true, // ✅ disables ESLint in production builds
//   },
//   webpack(config: any) {
//     config.module.rules.push({
//       test: /\.svg$/,
//       use: ["@svgr/webpack"],
//     });
//     return config;
//   },
// };

// module.exports = nextConfig;
