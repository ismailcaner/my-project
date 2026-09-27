import { useEffect, useState } from "react"
import { Folder, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function FolderManager({ selectedFolderId, onSelect }) {
  const [folders, setFolders] = useState([])
  const [open, setOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [name, setName] = useState("")

  const loadFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Failed to load folders:", error)
      return
    }

    setFolders(data || [])
  }

  useEffect(() => {
    loadFolders()

    const channel = supabase
      .channel("rt-folders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        loadFolders
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const saveFolder = async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    const result = editingFolder
      ? await supabase.from("folders").update({ name: trimmed }).eq("id", editingFolder.id)
      : await supabase.from("folders").insert({ name: trimmed })

    if (result.error) {
      console.error("Failed to save folder:", result.error)
      return
    }

    setOpen(false)
    setName("")
    setEditingFolder(null)
  }

  const deleteFolder = async (folder) => {
    const confirmed = window.confirm(
      `“${folder.name}” klasörü silinsin mi? Bookmark'lar silinmeyecek.`
    )
    if (!confirmed) return

    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", folder.id)

    if (error) {
      console.error("Failed to delete folder:", error)
      return
    }

    if (selectedFolderId === folder.id) onSelect(null)
  }

  return (
    <>
      <div className="m-3 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${
            selectedFolderId === null
              ? "border-[#ff5d26] bg-[#ff5d26]/10 text-[#ff5d26]"
              : "border-zinc-200 text-zinc-500"
          }`}
        >
          All
        </button>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`flex shrink-0 items-center rounded-full border ${
              selectedFolderId === folder.id
                ? "border-[#ff5d26] bg-[#ff5d26]/10"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <button
              onClick={() => onSelect(folder.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold ${
                selectedFolderId === folder.id ? "text-[#ff5d26]" : "text-zinc-500"
              }`}
            >
              <Folder size={15} />
              {folder.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full p-1.5 text-zinc-400 focus:outline-none">
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingFolder(folder)
                    setName(folder.name)
                    setOpen(true)
                  }}
                >
                  <Pencil size={15} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteFolder(folder)} className="text-red-500">
                  <Trash2 size={15} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        <Button
          onClick={() => {
            setEditingFolder(null)
            setName("")
            setOpen(true)
          }}
          size="sm"
          variant="outline"
          className="shrink-0 rounded-full"
        >
          <Plus size={16} /> Folder
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Edit folder" : "New folder"}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveFolder()
            }}
          />
          <Button onClick={saveFolder}>Save</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
