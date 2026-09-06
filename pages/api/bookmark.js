import { load } from "cheerio";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_TABLE_NAME,
} = process.env;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Supabase'den tüm bookmark'ları al
    const dbResponse = await fetch(
      `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${NEXT_PUBLIC_SUPABASE_TABLE_NAME}?select=id,urls`,
      {
        headers: {
          apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }
    );

    const bookmarks = await dbResponse.json();

    const results = await Promise.all(
      bookmarks.map(async (bookmark) => {
        try {
          const response = await fetch(bookmark.urls, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138 Safari/537.36",
            },
          });

          const html = await response.text();
          const $ = load(html);

          const image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

          return {
            id: bookmark.id,
            url: bookmark.urls,
            image,
          };
        } catch (error) {
          return {
            id: bookmark.id,
            url: bookmark.urls,
            image: "",
            error: error.message,
          };
        }
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}