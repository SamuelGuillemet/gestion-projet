import { useShallow } from "zustand/react/shallow";
import { useTagStore } from "@/store";

export function useTags() {
  const tags = useTagStore(useShallow((s) => s.tags));
  const addTag = useTagStore((s) => s.addTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = useTagStore((s) => s.deleteTag);
  return { tags, addTag, updateTag, deleteTag };
}
