import { LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
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
  const projectId = matchPath("/project/:projectId/*", pathname)?.params
    .projectId;
  if (!projectId) return 0;
  const index = items.findIndex(
    (item) => item.type === "project" && item.id === projectId,
  );
  return index === -1 ? 0 : index;
}

export function AppSwitcher() {
  const { projects, setActiveProject } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();

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
        setActiveProject(item.id);
        navigate(`/project/${item.id}/board`);
      } else {
        navigate("/dashboard/overview");
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
        const nextIndex =
          (currentIndex + direction + builtItems.length) % builtItems.length;
        itemsRef.current = builtItems;
        selectedIndexRef.current = nextIndex;
        openRef.current = true;
        setItems(builtItems);
        setSelectedIndex(nextIndex);
        setOpen(true);
        return;
      }

      const nextIndex =
        (selectedIndexRef.current + direction + itemsRef.current.length) %
        itemsRef.current.length;
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
  }, [navigate, setActiveProject]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      aria-label="Changer de vue"
      className="top-1/2 left-1/2 fixed bg-popover backdrop:bg-background/60 shadow-xl backdrop:backdrop-blur-sm p-2 border rounded-lg w-72 max-w-[calc(100vw-2rem)] text-popover-foreground -translate-x-1/2 -translate-y-1/2 transform"
    >
      <ul className="space-y-1 p-1 max-h-[70vh] overflow-y-auto">
        {items.map((item, index) => (
          <li
            key={item.type === "dashboard" ? "dashboard" : item.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              index === selectedIndex
                ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
                : "text-muted-foreground",
            )}
          >
            {item.type === "dashboard" ? (
              <LayoutDashboard className="size-4 shrink-0" />
            ) : (
              <span
                className="rounded-full size-2.5 shrink-0"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="truncate">
              {item.type === "dashboard" ? "Dashboard" : item.name}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        Alt (maintenu) + A pour parcourir (+ Maj pour l'ordre inverse), relâchez
        Alt pour valider
      </p>
    </dialog>
  );
}
