import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddItemRowProps {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
}

export function AddItemRow({
  value,
  onChange,
  onAdd,
  placeholder,
}: AddItemRowProps) {
  return (
    <div className="flex items-center gap-2 pt-2 pl-4">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 shrink-0"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
