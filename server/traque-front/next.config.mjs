/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',

  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
  
};

export default nextConfig;
