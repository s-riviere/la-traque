/** @type {import('next').NextConfig} */

const nextConfig = {

    output: 'standalone',

    async redirects() {
        return [
            {
                source: '/',
                destination: '/admin',
                permanent: false, // The browser will not save the redirect in its cache
            },
        ]
    },

};

export default nextConfig;
