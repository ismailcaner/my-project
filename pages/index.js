import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import BookmarkItem from "@/components/ui/custom/BookmarkItem"
import Title from "@/components/ui/custom/Title"
import Head from "next/head"
import useBookmarkActions from "@/hooks/useBookmarkActions"
import { Trash2 } from "lucide-react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ismailcaner.com"
const OG_IMAGE_URL = `${SITE_URL}/api/og`

export async function getStaticProps() {
  const { data, error } = await supabase
    .from("bookmark")
    .select("*")
    .order("pinned", { ascending: false })
    .order("title", { ascending: true })

  if (error) {
    console.error("Failed to load bookmarks:", error)
  }

  return {
    props: {
      initialData: data ?? [],
    },
    revalidate: 60,
  }
}

export default function Bookmark({ initialData }) {
  const [data, setData] = useState(initialData)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const { handleDelete } = useBookmarkActions()

  useEffect(() => {
    const channel = supabase
      .channel("rt-bookmark")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmark" },
        async () => {
          const { data, error } = await supabase
            .from("bookmark")
            .select("*")
            .order("pinned", { ascending: false })
            .order("title", { ascending: true })

          if (error) {
            console.error("Failed to refresh bookmarks:", error)
            return
          }

          setData(data || [])
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Supabase Realtime channel error")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLongPress = (id) => {
    setSelectMode(true)
    setSelectedIds([id])
  }

  const handleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      if (next.length === 0) setSelectMode(false)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    const confirmed = window.confirm(`${selectedIds.length} Bookmark silinecek. Emin misin?`)
    if (!confirmed) return

    const results = await Promise.all(selectedIds.map((id) => handleDelete(id)))
    const failed = results.filter((result) => !result.success)

    if (failed.length > 0) {
      window.alert(`${failed.length} bookmark silinemedi.`)
      return
    }

    setSelectedIds([])
    setSelectMode(false)
  }

  const pinnedItems = data
    .filter((item) => item.pinned)
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"))

  const normalItems = data.filter((item) => !item.pinned)
  const groupedData = {}

  normalItems.forEach((item) => {
    const letter = (item.title?.[0] || "#").toLocaleUpperCase("tr")
    groupedData[letter] ??= []
    groupedData[letter].push(item)
  })

  const sortedLetters = Object.keys(groupedData).sort((a, b) =>
    a.localeCompare(b, "tr")
  )

  return (
    <>
      <Head>
        <title>Bookmark</title>
        <meta property="og:title" content="Bookmark" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:image" content={OG_IMAGE_URL} />
      </Head>

      <Title />

      {selectMode && (
        <div className="fixed top-1 right-2.5 flex gap-2 z-50">
          <button
            onClick={handleDeleteSelected}
            className="p-1.5 px-3.5 items-center rounded-lg h-fit text-red-500 bg-red-100 border-1 border-red-300 font-semibold"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <div className="m-3 flex flex-col gap-4">
        {pinnedItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[16px] pt-8 text-[#ff5d26]">
              Pinned
            </span>

            {pinnedItems.map((item) => (
              <BookmarkItem
                key={item.id}
                item={item}
                selectMode={selectMode}
                selected={selectedIds.includes(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                onSelect={() => handleSelect(item.id)}
              />
            ))}
          </div>
        )}

        {sortedLetters.map((letter) => (
          <div key={letter} className="flex flex-col gap-2">
            <span className="font-semibold text-zinc-400 pl-1">{letter}</span>

            {groupedData[letter].map((item) => (
              <BookmarkItem
                key={item.id}
                item={item}
                selectMode={selectMode}
                selected={selectedIds.includes(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                onSelect={() => handleSelect(item.id)}
              />
            ))}
          </div>
        ))}

        <div className="h-10" />
      </div>
    </>
  )
}
