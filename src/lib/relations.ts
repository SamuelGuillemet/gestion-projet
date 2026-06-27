import {
  ArrowRightLeft,
  Ban,
  Copy,
  type LucideIcon,
  ShieldAlert,
} from "lucide-react";
import type { RelationType } from "@/models/relation";

export const RELATION_STYLES: Record<
  RelationType,
  { color: string; bg: string; icon: LucideIcon; className: string }
> = {
  blocks: {
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: Ban,
    className: "text-red-600 border-red-200 bg-red-50",
  },
  "blocked-by": {
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: ShieldAlert,
    className: "text-orange-600 border-orange-200 bg-orange-50",
  },
  relates: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: ArrowRightLeft,
    className: "text-blue-600 border-blue-200 bg-blue-50",
  },
  duplicates: {
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: Copy,
    className: "text-purple-600 border-purple-200 bg-purple-50",
  },
};

export function getInverseType(type: RelationType): RelationType {
  switch (type) {
    case "blocks":
      return "blocked-by";
    case "blocked-by":
      return "blocks";
    default:
      return type;
  }
}
