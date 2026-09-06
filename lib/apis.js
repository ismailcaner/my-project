const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_TABLE_NAME,
} = process.env;

const data = `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${NEXT_PUBLIC_SUPABASE_TABLE_NAME}?select=*`;

const apimethod = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    apikey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  },
};

export async function getData() {
  const response = await fetch(data, apimethod);
  return await response.json();
}

export const getFavicon = (url) => {
  if (!url) return ""
  const clean = url.replace(/^https?:\/\//, "").split("/")[0]
  return `https://www.google.com/s2/favicons?sz=256&domain=${clean}`
}