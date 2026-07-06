import { CalendarClock, Clipboard, Hourglass } from "lucide-react";
import { QuestionDetailContent } from "@/components/shared/QuestionDetailContent";
import { TaskDetailContent } from "@/components/shared/TaskDetailContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuestionActions, useQuestions } from "@/hooks/useQuestions";
import { useTaskActions, useTasks } from "@/hooks/useTasks";
import { FocusHeader } from "./FocusHeader";
import { FocusOverviewColumn } from "./FocusOverviewColumn";
import { useFocusDashboardData } from "./focus-data";
import { useFocusProjectVisibility, useFocusSelection } from "./focus-state";
import { ImportantInformation } from "./ImportantInformation";
import { ProjectsOverview } from "./ProjectsOverview";

export function FocusPage() {
  const tasks = useTasks();
  const questions = useQuestions();
  const { updateTask, deleteTask } = useTaskActions();
  const { updateQuestion, deleteQuestion } = useQuestionActions();
  const { selectedDetail, selectTask, selectQuestion, clearSelection } =
    useFocusSelection();
  const { hiddenProjectIds, setProjectVisible, showAllProjects } =
    useFocusProjectVisibility();
  const focusData = useFocusDashboardData(hiddenProjectIds);

  const selectedTask =
    selectedDetail?.type === "task"
      ? tasks.find((task) => task.id === selectedDetail.id)
      : null;
  const selectedQuestion =
    selectedDetail?.type === "question"
      ? questions.find((question) => question.id === selectedDetail.id)
      : null;
  const dialogOpen = Boolean(selectedTask || selectedQuestion);

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-4 pb-6 min-h-full">
        <FocusHeader
          dateLabel={focusData.dateLabel}
          projectCount={focusData.projectSummaries.length}
          openTaskCount={focusData.openTasks.length}
          inProgressCount={focusData.inProgressTasks.length}
          todoCount={focusData.todoTasks.length}
          blockedCount={focusData.blockedItems.length}
          projects={focusData.projects}
          hiddenProjectIds={hiddenProjectIds}
          onProjectVisibilityChange={setProjectVisible}
          onShowAllProjects={showAllProjects}
        />

        <ProjectsOverview summaries={focusData.projectSummaries} />

        <div className="gap-4 grid grid-cols-3" id="focus-overview">
          <FocusOverviewColumn
            icon={<Clipboard className="size-4" />}
            label="À démarrer"
            countLabel={`${focusData.notStartedItems.length} à lancer`}
            emptyLabel="Aucune tâche à démarrer ni question à poser."
            items={focusData.notStartedItems}
            onOpenTask={selectTask}
            onOpenQuestion={selectQuestion}
          />

          <FocusOverviewColumn
            icon={<CalendarClock className="size-4" />}
            label="Priorité"
            countLabel={`${focusData.priorityItems.length} ${pluralize(
              focusData.priorityItems.length,
              "tâche",
              "tâches",
            )}`}
            emptyLabel="Aucune tâche en cours ou à échéance."
            items={focusData.priorityItems}
            onOpenTask={selectTask}
            onOpenQuestion={selectQuestion}
          />

          <FocusOverviewColumn
            icon={<Hourglass className="size-4" />}
            label="En attente"
            countLabel={`${focusData.blockedItems.length} ${pluralize(
              focusData.blockedItems.length,
              "bloqué",
              "bloqués",
            )}`}
            items={focusData.blockedItems}
            emptyLabel="Aucune attente ouverte."
            onOpenTask={selectTask}
            onOpenQuestion={selectQuestion}
          />
        </div>

        <ImportantInformation
          staleTasks={focusData.staleTasks}
          onOpenTask={selectTask}
        />
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) clearSelection();
        }}
      >
        <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Détail de la tâche" : "Détail de la question"}
            </DialogTitle>
          </DialogHeader>

          {selectedTask ? (
            <TaskDetailContent
              task={selectedTask}
              onUpdate={(data) => updateTask(selectedTask.id, data)}
              onDelete={() => {
                deleteTask(selectedTask.id);
                clearSelection();
              }}
            />
          ) : null}

          {selectedQuestion ? (
            <QuestionDetailContent
              question={selectedQuestion}
              onUpdate={(data) => updateQuestion(selectedQuestion.id, data)}
              onDelete={() => {
                deleteQuestion(selectedQuestion.id);
                clearSelection();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular;
}
