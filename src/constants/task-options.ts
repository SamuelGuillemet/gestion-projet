import type { Task, TaskPriority } from "@/models/task";

interface PriorityOption {
  value: TaskPriority;
  label: string;
  color: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: "low", label: "🏝️ Basse", color: "#1089f1" },
  { value: "medium", label: "🏕️ Moyenne", color: "#f59e0b" },
  { value: "high", label: "🌋 Haute", color: "#ef4444" },
];

export const PRIORITY_BY_VALUE = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option]),
);

interface SizeOption {
  value: Task["size"];
  label: string;
  color: string;
}

export const SIZE_OPTIONS: SizeOption[] = [
  { value: "small", label: "▫️ Small", color: "#1089f1" },
  { value: "medium", label: "◻️ Medium", color: "#f59e0b" },
  { value: "large", label: "⬜ Large", color: "#ef4444" },
];

export const DUE_SOON_DAYS = 7;
export const STALE_DAYS = 14;
export const DAY_MS = 86_400_000;
