import { supabase } from "@/lib/supabase"

export default function useBookmarkActions() {
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("bookmark")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete bookmark:", error)
      return { success: false, error }
    }

    return { success: true }
  }

  const togglePin = async (item) => {
    const { error } = await supabase
      .from("bookmark")
      .update({ pinned: !item.pinned })
      .eq("id", item.id)

    if (error) {
      console.error("Failed to update bookmark pin:", error)
      return { success: false, error }
    }

    return { success: true }
  }

  const handleShare = async (item) => {
    if (!navigator.share) return { success: false, cancelled: true }

    try {
      await navigator.share({
        title: item.title,
        url: item.urls,
      })

      return { success: true }
    } catch (error) {
      if (error?.name === "AbortError") {
        return { success: false, cancelled: true }
      }

      console.error("Failed to share bookmark:", error)
      return { success: false, error }
    }
  }

  const handleUpdate = async (id, fields) => {
    const { error } = await supabase
      .from("bookmark")
      .update(fields)
      .eq("id", id)

    if (error) {
      console.error("Failed to update bookmark:", error)
      return { success: false, error }
    }

    return { success: true }
  }

  return {
    handleDelete,
    togglePin,
    handleShare,
    handleUpdate,
  }
}
