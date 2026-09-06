import '@/styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  const ogImage = `https://yerimi.vercel.app/api/og`;

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="white" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/Group 4.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/Group 4.png" type="image/x-icon" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yerimi.vercel.app" />
        <meta property="og:title" content="Bookmark" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://yerimi.vercel.app" />
        <meta property="twitter:title" content="Bookmark" />
        <meta property="twitter:image" content={ogImage} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}