/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/verify',
        destination: '/auth/verify',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig

