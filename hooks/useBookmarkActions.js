import { supabase } from "@/lib/supabase"

export default function useBookmarkActions() {

  const handleDelete = async (id) => {
    await supabase
    .from("bookmark")
    .delete()
    .eq("id", id)
  }

  const togglePin = async (item) => {
    await supabase
      .from("bookmark")
      .update({ pinned: !item.pinned })
      .eq("id", item.id)
  }

  const handleShare = async (item) => {
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        url: `https://yerimi.vercel.app/go?url=${encodeURIComponent(item.urls)}&title=${encodeURIComponent(item.title)}`,
      })
    }
  }

  const handleUpdate = async (id, fields) => {
    await supabase
    .from("bookmark")
    .update(fields)
    .eq("id", id)
  }

  return {
    handleDelete,
    togglePin,
    handleShare,
    handleUpdate,
  }
}