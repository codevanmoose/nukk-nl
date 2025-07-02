import Script from 'next/script';

export default function AdScript() {
  // Only load in production with valid AdSense client ID
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}