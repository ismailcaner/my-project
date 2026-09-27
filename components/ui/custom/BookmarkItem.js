import { useState } from "react"
import {
  Trash2,
  Share,
  Pin,
  PinOff,
  Pencil,
  Menu,
  Folder,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import useBookmarkActions from "@/hooks/useBookmarkActions"
import { getFavicon } from "@/lib/apis"
import { useLongPress } from "use-long-press"

export default function BookmarkItem({
  item,
  folders = [],
  selectMode,
  selected,
  onLongPress,
  onSelect,
}) {
  const { handleShare, handleDelete, togglePin, handleUpdate, moveToFolder } = useBookmarkActions()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(item.title || "")
  const capitalizeFirst = (text = "") =>
    text.charAt(0).toLocaleUpperCase("tr") + text.slice(1)

  const bind = useLongPress(() => {
    onLongPress()
  }, {
    threshold: 500,
    cancelOnMovement: false,
    onStart: (e) => e.preventDefault(),
  })

  const currentFolder = folders.find((folder) => folder.id === item.folder_id)

  return (
    <>
      <div
        {...bind()}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (selectMode) {
            onSelect()
          } else {
            const link = document.createElement("a")
            link.href = item.urls
            link.target = "_blank"
            link.rel = "noopener noreferrer"
            link.click()
          }
        }}
        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer ${
          item.pinned
            ? "border-[#ff5d26] bg-[#ff5d26]/25 text-[#ff5d26] h-17"
            : "border-zinc-200 bg-zinc-100 h-17"
        }`}
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      >
        <div className="flex items-center gap-4 h-full min-w-0">
          <img src={getFavicon(item.urls)} className="h-full w-auto rounded object-cover" />

          <div className="flex flex-col justify-center min-w-0 max-w-[220px]">
            <span className="font-semibold text-[16px] truncate">
              {capitalizeFirst(item.title)}
            </span>
            <span
              className={`text-[12px] truncate ${
                item.pinned ? "text-[#ff5d26]" : "text-zinc-400"
              }`}
            >
              {item.urls}
            </span>
            {currentFolder && (
              <span className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                <Folder size={10} /> {currentFolder.name}
              </span>
            )}
          </div>
        </div>

        {selectMode ? (
          <input
            type="checkbox"
            readOnly
            checked={selected}
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className="accent-[#ff5d26] w-5 h-5 m-2 p-1.5"
          />
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none rounded-full p-1.5 text-zinc-500">
                <Menu color={item.pinned ? "#ff5d26" : "grey"} />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-zinc-50 dark:bg-[#181818]">
                <DropdownMenuItem
                  onClick={() => togglePin(item)}
                  className="p-2.5 rounded-br-sm rounded-bl-sm h-fit text-zinc-500 bg-zinc-100 border-0 font-semibold grid grid-cols-[20px_1fr] dark:bg-[#2a2a2a]"
                >
                  {item.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                  {item.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="p-2.5 rounded-sm h-fit text-zinc-500 bg-zinc-100 font-semibold grid grid-cols-[20px_1fr] dark:bg-[#2a2a2a]">
                    <Folder size={16} />
                    Move to folder
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => moveToFolder(item.id, null)}>
                      No folder
                    </DropdownMenuItem>
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => moveToFolder(item.id, folder.id)}
                      >
                        <Folder size={15} />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem
                  onClick={() => handleShare(item)}
                  className="p-2.5 rounded-sm h-fit text-zinc-500 bg-zinc-100 border-0 font-semibold grid grid-cols-[20px_1fr] dark:bg-[#2a2a2a]"
                >
                  <Share />
                  <span>Share</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setTitle(item.title || "")
                    setOpen(true)
                  }}
                  className="p-2.5 rounded-sm h-fit text-zinc-500 bg-zinc-100 border-0 font-semibold grid grid-cols-[20px_1fr] dark:bg-[#2a2a2a]"
                >
                  <Pencil size={16} />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDelete(item.id)}
                  className="delete-menu-item p-2.5 rounded-tr-sm rounded-tl-sm h-fit text-red-500 bg-red-100 border-0 border-red-200 dark:bg-[#2a2a2a] dark:text-red-500 dark:border-2 dark:border-red-500 font-semibold grid grid-cols-[20px_1fr]"
                >
                  <Trash2 color="red" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="justify-start flex">Title</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Başlık"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleUpdate(item.id, { title: title.trim() })
                setOpen(false)
              }
            }}
          />
          <Button
            onClick={async () => {
              await handleUpdate(item.id, { title: title.trim() })
              setOpen(false)
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
