import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { HELP_SECTIONS } from "./help-content";

export function HelpDialog() {
  const [activeId, setActiveId] = useState(HELP_SECTIONS[0].id);
  const activeSection = HELP_SECTIONS.find((s) => s.id === activeId) ?? HELP_SECTIONS[0];

  return (
    <Dialog onOpenChange={(open) => open && setActiveId(HELP_SECTIONS[0].id)}>
      <DialogTrigger render={<span />} nativeButton={false}>
        <Button variant="outline" size="sm" title="Aide & documentation">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden 2xl:inline">Aide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[82vh] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Aide & documentation</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-4">
          <nav className="flex w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r pr-2">
            {HELP_SECTIONS.map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  id === activeId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{title}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
            <h3 className="font-heading text-base font-medium">{activeSection.title}</h3>
            {activeSection.paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {activeSection.bullets && (
              <ul className="list-disc space-y-1.5 pl-4">
                {activeSection.bullets.map((bullet) => (
                  <li key={bullet} className="text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
