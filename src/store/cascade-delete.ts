import {
  useDeliverableStore,
  useNoteStore,
  useProjectStore,
  useQuestionStore,
  useRelationStore,
  useTagStore,
  useTaskStore,
  useTimeStore,
} from "./index";
import { cleanupMarkdownImages } from "./markdown-image.store";

function removeRelationsByEntityIds(entityIds: Set<string>) {
  if (entityIds.size === 0) return;

  useRelationStore.setState((state) => ({
    relations: state.relations.filter(
      (relation) =>
        !entityIds.has(relation.sourceId) && !entityIds.has(relation.targetId),
    ),
  }));
}

export function deleteTaskCascade(taskId: string) {
  useTaskStore.getState().deleteTask(taskId);

  useTimeStore.setState((state) => ({
    timeEntries: state.timeEntries.filter((entry) => entry.taskId !== taskId),
  }));

  removeRelationsByEntityIds(new Set([taskId]));
}

export function deleteQuestionCascade(questionId: string) {
  useQuestionStore.getState().deleteQuestion(questionId);
  removeRelationsByEntityIds(new Set([questionId]));
}

export function deleteDeliverableCascade(deliverableId: string) {
  useDeliverableStore.getState().deleteDeliverable(deliverableId);
  removeRelationsByEntityIds(new Set([deliverableId]));
}

export function deleteTagCascade(tagId: string) {
  useTagStore.getState().deleteTag(tagId);

  useTaskStore.setState((state) => ({
    tasks: state.tasks.map((task) =>
      task.tags.includes(tagId)
        ? {
            ...task,
            tags: task.tags.filter((taskTagId) => taskTagId !== tagId),
          }
        : task,
    ),
  }));
}

export function deleteNoteCascade(noteId: string) {
  useNoteStore.getState().deleteNote(noteId);

  const remainingContents = useNoteStore
    .getState()
    .notes.map((note) => note.content);
  void cleanupMarkdownImages(remainingContents);
}

export function deleteProjectCascade(projectId: string) {
  const tasksToDelete = useTaskStore
    .getState()
    .tasks.filter((task) => task.projectId === projectId);
  const taskIds = new Set(tasksToDelete.map((task) => task.id));

  const questionIds = new Set(
    useQuestionStore
      .getState()
      .questions.filter((question) => question.projectId === projectId)
      .map((question) => question.id),
  );

  const deliverableIds = new Set(
    useDeliverableStore
      .getState()
      .deliverables.filter((deliverable) => deliverable.projectId === projectId)
      .map((deliverable) => deliverable.id),
  );

  const noteIds = new Set(
    useNoteStore
      .getState()
      .notes.filter((note) => note.projectId === projectId)
      .map((note) => note.id),
  );

  const relatedEntityIds = new Set<string>([
    ...taskIds,
    ...questionIds,
    ...deliverableIds,
  ]);

  useProjectStore.getState().deleteProject(projectId);

  useTaskStore.setState((state) => ({
    tasks: state.tasks.filter((task) => task.projectId !== projectId),
  }));

  useQuestionStore.setState((state) => ({
    questions: state.questions.filter(
      (question) => question.projectId !== projectId,
    ),
  }));

  useDeliverableStore.setState((state) => ({
    deliverables: state.deliverables.filter(
      (deliverable) => deliverable.projectId !== projectId,
    ),
  }));

  useNoteStore.setState((state) => ({
    notes: state.notes.filter((note) => note.projectId !== projectId),
  }));

  useTimeStore.setState((state) => ({
    timeEntries: state.timeEntries.filter(
      (entry) => entry.projectId !== projectId,
    ),
    milestones: state.milestones.filter(
      (milestone) => milestone.projectId !== projectId,
    ),
  }));

  removeRelationsByEntityIds(relatedEntityIds);

  if (noteIds.size > 0) {
    const remainingContents = useNoteStore
      .getState()
      .notes.map((note) => note.content);
    void cleanupMarkdownImages(remainingContents);
  }
}
