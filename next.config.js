/** @type {import('next').NextConfig} */
// const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    // logging: {
    //     fetches: {
    //         fullUrl: true,
    //     },
    // },
    // assetPrefix: isProd ? '/Prossity/' : '', // Adjust for your GitHub Pages repo name
    // basePath: isProd ? '/Prossity' : '',    // Adjust for your GitHub Pages repo name
    // trailingSlash: true,                    // Ensures that static assets are correctly referenced
    // images: {
    //     unoptimized: true,                  // GitHub Pages doesn't support image optimization
    // },
    // output: 'standalone',  // This is important for Vercel to handle dynamic routes

};

module.exports = nextConfig;
