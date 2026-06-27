import { create } from "zustand";
import type { Section } from "@/components/backlog/backlog-state";
import {
  useDeliverableStore,
  useNoteStore,
  useProjectStore,
  useQuestionStore,
  useTaskStore,
} from "@/store";

export type SearchEntityType = "notes" | "tasks" | "questions" | "deliverables";

export type GlobalSearchResult = {
  id: string;
  type: SearchEntityType;
  projectId: string;
  projectName: string;
  projectColor: string;
  title: string;
  snippet: string;
  score: number;
};

type NotesOpenIntent = {
  type: "notes";
  noteId: string;
  projectId: string;
};

type BacklogOpenIntent = {
  type: Section;
  id: string;
  projectId: string;
};

type GlobalSearchState = {
  open: boolean;
  query: string;
  highlightedIndex: number;
  pendingNoteIntent: NotesOpenIntent | null;
  pendingBacklogIntent: BacklogOpenIntent | null;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setHighlightedIndex: (index: number) => void;
  clear: () => void;
  setPendingNoteIntent: (intent: NotesOpenIntent | null) => void;
  setPendingBacklogIntent: (intent: BacklogOpenIntent | null) => void;
  openResult: (
    result: GlobalSearchResult,
    navigate: (to: string) => void,
  ) => void;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function createSnippet(text: string, query: string) {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);

  if (!normalizedText || !normalizedQuery) {
    return text.slice(0, 160);
  }

  const matchIndex = normalizedText.indexOf(normalizedQuery);
  if (matchIndex < 0) {
    return text.slice(0, 160);
  }

  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, matchIndex + normalizedQuery.length + 80);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function scoreTextMatch(title: string, body: string, query: string) {
  const normalizedQuery = normalize(query);
  const normalizedTitle = normalize(title);
  const normalizedBody = normalize(body);

  if (!normalizedQuery) return 0;
  if (normalizedTitle === normalizedQuery) return 100;
  if (normalizedTitle.startsWith(normalizedQuery)) return 75;
  if (normalizedTitle.includes(normalizedQuery)) return 55;
  if (normalizedBody.includes(normalizedQuery)) return 30;
  return 0;
}

export function buildGlobalSearchResults(query: string): GlobalSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const projects = useProjectStore.getState().projects;
  const projectById = new Map(projects.map((project) => [project.id, project]));

  const notes = useNoteStore.getState().notes;
  const tasks = useTaskStore.getState().tasks;
  const questions = useQuestionStore.getState().questions;
  const deliverables = useDeliverableStore.getState().deliverables;

  const results: GlobalSearchResult[] = [];

  for (const note of notes) {
    const score = scoreTextMatch(note.title, note.content, normalizedQuery);
    if (score === 0) continue;
    results.push({
      id: note.id,
      type: "notes",
      projectId: note.projectId,
      projectName: projectById.get(note.projectId)?.name ?? "Projet inconnu",
      projectColor: projectById.get(note.projectId)?.color ?? "#6b7280",
      title: note.title || "Sans titre",
      snippet: createSnippet(note.content, normalizedQuery),
      score,
    });
  }

  for (const task of tasks) {
    const score = scoreTextMatch(task.title, task.description, normalizedQuery);
    if (score === 0) continue;
    results.push({
      id: task.id,
      type: "tasks",
      projectId: task.projectId,
      projectName: projectById.get(task.projectId)?.name ?? "Projet inconnu",
      projectColor: projectById.get(task.projectId)?.color ?? "#6b7280",
      title: task.title || "Sans titre",
      snippet: createSnippet(task.description, normalizedQuery),
      score,
    });
  }

  for (const question of questions) {
    const content = `${question.description ?? ""}\n${question.answer ?? ""}\n${question.recipient ?? ""}`;
    const score = scoreTextMatch(question.title, content, normalizedQuery);
    if (score === 0) continue;
    results.push({
      id: question.id,
      type: "questions",
      projectId: question.projectId,
      projectName:
        projectById.get(question.projectId)?.name ?? "Projet inconnu",
      projectColor: projectById.get(question.projectId)?.color ?? "#6b7280",
      title: question.title || "Sans titre",
      snippet: createSnippet(content, normalizedQuery),
      score,
    });
  }

  for (const deliverable of deliverables) {
    const content = `${deliverable.description ?? ""}\n${deliverable.type ?? ""}\n${deliverable.version ?? ""}`;
    const score = scoreTextMatch(deliverable.title, content, normalizedQuery);
    if (score === 0) continue;
    results.push({
      id: deliverable.id,
      type: "deliverables",
      projectId: deliverable.projectId,
      projectName:
        projectById.get(deliverable.projectId)?.name ?? "Projet inconnu",
      projectColor: projectById.get(deliverable.projectId)?.color ?? "#6b7280",
      title: deliverable.title || "Sans titre",
      snippet: createSnippet(content, normalizedQuery),
      score,
    });
  }

  return results.sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
}

export const useGlobalSearchState = create<GlobalSearchState>()((set) => ({
  open: false,
  query: "",
  highlightedIndex: 0,
  pendingNoteIntent: null,
  pendingBacklogIntent: null,
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query, highlightedIndex: 0 }),
  setHighlightedIndex: (highlightedIndex) => set({ highlightedIndex }),
  clear: () => set({ query: "", highlightedIndex: 0 }),
  setPendingNoteIntent: (pendingNoteIntent) => set({ pendingNoteIntent }),
  setPendingBacklogIntent: (pendingBacklogIntent) =>
    set({ pendingBacklogIntent }),
  openResult: (result, navigate) => {
    useProjectStore.getState().setActiveProject(result.projectId);

    if (result.type === "notes") {
      set({
        pendingNoteIntent: {
          type: "notes",
          noteId: result.id,
          projectId: result.projectId,
        },
        pendingBacklogIntent: null,
        open: false,
      });
      navigate("/notes");
      return;
    }

    set({
      pendingBacklogIntent: {
        type: result.type,
        id: result.id,
        projectId: result.projectId,
      },
      pendingNoteIntent: null,
      open: false,
    });
    navigate("/backlog");
  },
}));
