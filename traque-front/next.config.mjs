/** @type {import('next').NextConfig} */

const nextConfig = {

    output: 'standalone',

    async redirects() {
        return [
            {
                source: '/',
                destination: '/admin',
                permanent: true, // The browser will save the redirect in its cache, empty the cache to change the redirect
            },
        ]
    },

};

export default nextConfig;
