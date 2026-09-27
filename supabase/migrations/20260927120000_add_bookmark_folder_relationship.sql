alter table public.bookmark add column if not exists folder_id uuid null;

alter table public.bookmark drop constraint if exists bookmark_folder_id_fkey;
alter table public.bookmark
  add constraint bookmark_folder_id_fkey
  foreign key (folder_id) references public.folders(id) on delete set null;

create index if not exists bookmark_folder_id_idx on public.bookmark(folder_id);

alter table public.folders enable row level security;

drop policy if exists "all folders" on public.folders;
create policy "all folders"
on public.folders
for all
using (true)
with check (true);

alter publication supabase_realtime add table public.folders;
