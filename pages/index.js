import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import BookmarkItem from "@/components/ui/custom/BookmarkItem"
import Title from "@/components/ui/custom/Title"
import Head from 'next/head'
import useBookmarkActions from "@/hooks/useBookmarkActions"
import {
  Trash2
} from "lucide-react"

export async function getStaticProps() {
  const { data } = await supabase
    .from("bookmark")
    .select("*")
    .order("pinned", { ascending: false })
    .order("title", { ascending: true })

  return {
    props: {
      initialData: data ?? [],
    },
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
          const { data } = await supabase
            .from("bookmark")
            .select("*")
            .order("pinned", { ascending: false })
            .order("title", { ascending: true })

          setData(data || [])
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
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
    const confirmed = window.confirm(`${selectedIds.length} Bookmark silinecek. Emin misin ?`)
    if (!confirmed) return
    await Promise.all(selectedIds.map((id) => handleDelete(id)))
    setSelectedIds([])
    setSelectMode(false)
  }

  const pinnedItems = data
    .filter((item) => item.pinned)
    .sort((a, b) => a.title.localeCompare(b.title, "tr"))
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
        <meta property="og:image" content="https://yerimi.vercel.app/api/og" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="https://yerimi.vercel.app/api/og" />
      </Head>

      <Title />

      {selectMode && (
  <div className="fixed top-1 right-2.5 flex gap-2 z-50">
    <button
      onClick={handleDeleteSelected}
      className="p-1.5 px-3.5 items-center rounded-lg h-fit text-red-500 bg-red-100 border-1 border-red-300 font-semibold"
    >
          <Trash2 size={18}/>

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
            <span className="font-semibold text-zinc-400 pl-1">
              {letter}
            </span>

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