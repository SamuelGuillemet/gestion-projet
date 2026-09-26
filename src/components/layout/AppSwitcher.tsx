import { LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import type { Project } from "@/models/project";

type SwitcherItem =
  | { type: "dashboard" }
  | { type: "project"; id: string; name: string; color: string };

function buildSwitcherItems(projects: Project[]): SwitcherItem[] {
  return [
    { type: "dashboard" },
    ...projects.map((project) => ({
      type: "project" as const,
      id: project.id,
      name: project.name,
      color: project.color,
    })),
  ];
}

function getCurrentIndex(items: SwitcherItem[], pathname: string): number {
  const projectId = matchPath("/project/:projectId/*", pathname)?.params.projectId;
  if (!projectId) return 0;
  const index = items.findIndex((item) => item.type === "project" && item.id === projectId);
  return index === -1 ? 0 : index;
}

export function AppSwitcher() {
  const { projects } = useProjects();
  const location = useLocation();
  const { switchProject, switchToDashboard } = useProjectNavigation();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SwitcherItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openRef = useRef(false);
  const itemsRef = useRef<SwitcherItem[]>([]);
  const selectedIndexRef = useRef(0);
  const projectsRef = useRef(projects);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const commitSelection = () => {
      const item = itemsRef.current[selectedIndexRef.current];
      if (!item) return;
      if (item.type === "project") {
        switchProject(item.id);
      } else {
        switchToDashboard();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.key.toLowerCase() !== "a" || event.repeat) {
        return;
      }
      event.preventDefault();

      const direction = event.shiftKey ? -1 : 1;

      if (!openRef.current) {
        const builtItems = buildSwitcherItems(projectsRef.current);
        if (builtItems.length <= 1) return;
        const currentIndex = getCurrentIndex(builtItems, pathnameRef.current);
        const nextIndex = (currentIndex + direction + builtItems.length) % builtItems.length;
        itemsRef.current = builtItems;
        selectedIndexRef.current = nextIndex;
        openRef.current = true;
        setItems(builtItems);
        setSelectedIndex(nextIndex);
        setOpen(true);
        return;
      }

      const nextIndex =
        (selectedIndexRef.current + direction + itemsRef.current.length) % itemsRef.current.length;
      selectedIndexRef.current = nextIndex;
      setSelectedIndex(nextIndex);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "Alt" || !openRef.current) return;
      openRef.current = false;
      setOpen(false);
      commitSelection();
    };

    const handleBlur = () => {
      if (!openRef.current) return;
      openRef.current = false;
      setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [switchProject, switchToDashboard]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      aria-label="Changer de vue"
      className="fixed top-1/2 left-1/2 w-72 max-w-viewport-inset -translate-x-1/2 -translate-y-1/2 transform rounded-lg border bg-popover p-2 text-popover-foreground shadow-xl backdrop:bg-background/60 backdrop:backdrop-blur-sm"
    >
      <ul className="max-h-list space-y-1 overflow-y-auto p-1">
        {items.map((item, index) => (
          <li key={item.type === "dashboard" ? "dashboard" : item.id}>
            <button
              type="button"
              onClick={() => {
                openRef.current = false;
                setOpen(false);
                if (item.type === "project") {
                  switchProject(item.id);
                } else {
                  switchToDashboard();
                }
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-accent/55",
              )}
            >
              {item.type === "dashboard" ? (
                <LayoutDashboard className="size-4 shrink-0" />
              ) : (
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="truncate">
                {item.type === "dashboard" ? "Dashboard" : item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 px-1 text-2xs text-muted-foreground">
        Alt (maintenu) + A pour parcourir (+ Maj pour l'ordre inverse), relâchez Alt pour valider
      </p>
    </dialog>
  );
}
