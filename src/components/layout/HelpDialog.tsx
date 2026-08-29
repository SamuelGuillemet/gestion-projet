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
  const activeSection =
    HELP_SECTIONS.find((s) => s.id === activeId) ?? HELP_SECTIONS[0];

  return (
    <Dialog onOpenChange={(open) => open && setActiveId(HELP_SECTIONS[0].id)}>
      <DialogTrigger render={<span />} nativeButton={false}>
        <Button variant="outline" size="sm" title="Aide & documentation">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden 2xl:inline">Aide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-3xl h-[82vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Aide & documentation</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0">
          <nav className="flex flex-col gap-1 pr-2 border-r w-44 overflow-y-auto shrink-0">
            {HELP_SECTIONS.map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors",
                  id === activeId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{title}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-3 pr-1 overflow-y-auto text-sm">
            <h3 className="font-heading font-medium text-base">
              {activeSection.title}
            </h3>
            {activeSection.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            {activeSection.bullets && (
              <ul className="space-y-1.5 pl-4 list-disc">
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
