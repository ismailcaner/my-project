import "@/styles/globals.css"
import Head from "next/head"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ismailcaner.com"
const OG_IMAGE_URL = `${SITE_URL}/api/og`

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/Group 4.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/Group 4.png" type="image/x-icon" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Bookmark" />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:title" content="Bookmark" />
        <meta property="twitter:image" content={OG_IMAGE_URL} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
