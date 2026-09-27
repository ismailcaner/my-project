import { Folder } from "lucide-react"

export default function FolderPicker({ folders = [], selectedFolderId, onSelect }) {
  return (
    <div className="m-3 flex items-center gap-2 overflow-x-auto pb-1">
      <button onClick={() => onSelect(null)} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedFolderId === null ? "border-[#ff5d26] bg-[#ff5d26]/10 text-[#ff5d26]" : "border-zinc-200 text-zinc-500"}`}>
        All
      </button>
      {folders.map((folder) => (
        <button key={folder.id} onClick={() => onSelect(folder.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${selectedFolderId === folder.id ? "border-[#ff5d26] bg-[#ff5d26]/10 text-[#ff5d26]" : "border-zinc-200 text-zinc-500"}`}>
          <Folder size={15} /> {folder.name}
        </button>
      ))}
    </div>
  )
}
