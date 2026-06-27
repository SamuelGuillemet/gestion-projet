import { create } from "zustand";
import type { EntityReferenceType } from "@/lib/entity-references";
import {
  useDeliverableStore,
  useNoteStore,
  useProjectStore,
  useQuestionStore,
  useTaskStore,
} from "@/store";

export type SearchEntityType = EntityReferenceType;

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

type GlobalSearchState = {
  open: boolean;
  query: string;
  highlightedIndex: number;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setHighlightedIndex: (index: number) => void;
  clear: () => void;
};

type SearchableEntity = {
  id: string;
  projectId: string;
  title: string;
  body: string;
};

type GlobalSearchAdapter = {
  type: SearchEntityType;
  getItems: () => SearchableEntity[];
};

const GLOBAL_SEARCH_ADAPTERS: GlobalSearchAdapter[] = [
  {
    type: "notes",
    getItems: () =>
      useNoteStore.getState().notes.map((note) => ({
        id: note.id,
        projectId: note.projectId,
        title: note.title,
        body: note.content,
      })),
  },
  {
    type: "tasks",
    getItems: () =>
      useTaskStore.getState().tasks.map((task) => ({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        body: task.description,
      })),
  },
  {
    type: "questions",
    getItems: () =>
      useQuestionStore.getState().questions.map((question) => ({
        id: question.id,
        projectId: question.projectId,
        title: question.title,
        body: `${question.description ?? ""}\n${question.answer ?? ""}\n${question.recipient ?? ""}`,
      })),
  },
  {
    type: "deliverables",
    getItems: () =>
      useDeliverableStore.getState().deliverables.map((deliverable) => ({
        id: deliverable.id,
        projectId: deliverable.projectId,
        title: deliverable.title,
        body: `${deliverable.description ?? ""}\n${deliverable.type ?? ""}\n${deliverable.version ?? ""}`,
      })),
  },
];

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

  const results: GlobalSearchResult[] = [];

  for (const adapter of GLOBAL_SEARCH_ADAPTERS) {
    for (const item of adapter.getItems()) {
      const score = scoreTextMatch(item.title, item.body, normalizedQuery);
      if (score === 0) continue;

      const project = projectById.get(item.projectId);
      results.push({
        id: item.id,
        type: adapter.type,
        projectId: item.projectId,
        projectName: project?.name ?? "Projet inconnu",
        projectColor: project?.color ?? "#6b7280",
        title: item.title || "Sans titre",
        snippet: createSnippet(item.body, normalizedQuery),
        score,
      });
    }
  }

  return results.sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
}

export const useGlobalSearchState = create<GlobalSearchState>()((set) => ({
  open: false,
  query: "",
  highlightedIndex: 0,
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query, highlightedIndex: 0 }),
  setHighlightedIndex: (highlightedIndex) => set({ highlightedIndex }),
  clear: () => set({ query: "", highlightedIndex: 0 }),
}));
