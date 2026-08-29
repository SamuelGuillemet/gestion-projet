import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ThemeMode, useTheme } from "./theme-state";

const MODE_SEQUENCE: ThemeMode[] = ["light", "dark", "system"];

const MODE_META: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: "Clair" },
  dark: { icon: Moon, label: "Sombre" },
  system: { icon: Monitor, label: "Système" },
};

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const { icon: Icon, label } = MODE_META[mode];

  const handleClick = () => {
    const nextIndex = (MODE_SEQUENCE.indexOf(mode) + 1) % MODE_SEQUENCE.length;
    setMode(MODE_SEQUENCE[nextIndex]);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      title={`Thème : ${label} (cliquer pour changer)`}
      onClick={handleClick}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}
