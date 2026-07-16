import { useShallow } from "zustand/react/shallow";
import { useTagStore } from "@/store";
import { deleteTagCascade } from "@/store/cascade-delete";

export function useTags() {
  const tags = useTagStore(useShallow((s) => s.tags));
  const addTag = useTagStore((s) => s.addTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = deleteTagCascade;
  return { tags, addTag, updateTag, deleteTag };
}
