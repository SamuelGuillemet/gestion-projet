import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBacklogUI } from "@/components/backlog/backlog-state";
import { useNotesUI } from "@/components/notes/notes-state";
import type { EntityReference } from "@/lib/entity-references";
import {
  useDeliverableStore,
  useNoteStore,
  useProjectStore,
  useQuestionStore,
  useTaskStore,
} from "@/store";

export function useEntityReferenceNavigation(projectId?: string | null) {
  const navigate = useNavigate();

  return useCallback(
    (reference: EntityReference) => {
      const targetProjectId =
        projectId ?? useProjectStore.getState().activeProjectId;
      if (!targetProjectId) return false;

      if (reference.type === "notes") {
        const note = useNoteStore
          .getState()
          .notes.find(
            (item) =>
              item.projectId === targetProjectId &&
              item.number === reference.number,
          );
        if (!note) return false;

        useProjectStore.getState().setActiveProject(note.projectId);
        useNotesUI.getState().setActiveNoteId(note.projectId, note.id);
        navigate("/notes");
        return true;
      }

      if (reference.type === "tasks") {
        const task = useTaskStore
          .getState()
          .tasks.find(
            (item) =>
              item.projectId === targetProjectId &&
              item.number === reference.number,
          );
        if (!task) return false;

        useProjectStore.getState().setActiveProject(task.projectId);
        useBacklogUI.getState().select({ type: "tasks", id: task.id });
        navigate("/backlog");
        return true;
      }

      if (reference.type === "questions") {
        const question = useQuestionStore
          .getState()
          .questions.find(
            (item) =>
              item.projectId === targetProjectId &&
              item.number === reference.number,
          );
        if (!question) return false;

        useProjectStore.getState().setActiveProject(question.projectId);
        useBacklogUI.getState().select({ type: "questions", id: question.id });
        navigate("/backlog");
        return true;
      }

      const deliverable = useDeliverableStore
        .getState()
        .deliverables.find(
          (item) =>
            item.projectId === targetProjectId &&
            item.number === reference.number,
        );
      if (!deliverable) return false;

      useProjectStore.getState().setActiveProject(deliverable.projectId);
      useBacklogUI
        .getState()
        .select({ type: "deliverables", id: deliverable.id });
      navigate("/backlog");
      return true;
    },
    [navigate, projectId],
  );
}
