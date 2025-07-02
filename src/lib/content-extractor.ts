// For Vercel deployment, we must use a serverless approach
// Neither Puppeteer nor Playwright work on Vercel serverless functions
export * from './content-extractor-serverless';