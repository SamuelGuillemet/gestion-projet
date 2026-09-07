export { cn } from "cn";

export function generateId(): string {
  return crypto.randomUUID();
}
