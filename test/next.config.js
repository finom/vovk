/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['class-transformer/storage'] = false;
    return config;
  },
};

module.exports = nextConfig;
