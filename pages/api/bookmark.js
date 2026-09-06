import { load } from "cheerio"

const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_TABLE_NAME,
} = process.env

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138 Safari/537.36"

const CONCURRENCY = 5
const FETCH_TIMEOUT = 10000

async function fetchBookmarkImage(bookmark) {
  try {
    const url = new URL(bookmark.urls)

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error("Unsupported URL protocol")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      })

      if (!response.ok) {
        throw new Error(`Remote page returned ${response.status}`)
      }

      const html = await response.text()
      const $ = load(html)

      const image =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        ""

      return {
        id: bookmark.id,
        url: bookmark.urls,
        image,
      }
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    return {
      id: bookmark.id,
      url: bookmark.urls,
      image: "",
      error: error.name === "AbortError" ? "Request timed out" : error.message,
    }
  }
}

async function mapWithConcurrency(items, mapper, concurrency) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) return
      results[index] = await mapper(items[index])
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  )

  await Promise.all(workers)
  return results
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (
    !NEXT_PUBLIC_SUPABASE_URL ||
    !NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !NEXT_PUBLIC_SUPABASE_TABLE_NAME
  ) {
    return res.status(500).json({ error: "Supabase environment variables are missing" })
  }

  try {
    const dbResponse = await fetch(
      `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${NEXT_PUBLIC_SUPABASE_TABLE_NAME}?select=id,urls`,
      {
        headers: {
          apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }
    )

    if (!dbResponse.ok) {
      const message = await dbResponse.text()
      throw new Error(`Supabase returned ${dbResponse.status}: ${message}`)
    }

    const bookmarks = await dbResponse.json()

    if (!Array.isArray(bookmarks)) {
      throw new Error("Supabase returned an invalid bookmark list")
    }

    const results = await mapWithConcurrency(
      bookmarks,
      fetchBookmarkImage,
      CONCURRENCY
    )

    return res.status(200).json(results)
  } catch (error) {
    console.error("Bookmark API error:", error)

    return res.status(500).json({
      error: error.message || "Unexpected server error",
    })
  }
}
