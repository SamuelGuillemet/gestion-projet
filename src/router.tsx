import { createHashRouter, Navigate } from "react-router-dom";
import { BacklogPage } from "@/components/backlog/BacklogTreeView";
import { BoardPage } from "@/components/board/Board";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotesPage } from "@/components/notes/NoteEditor";
import { TimePage } from "@/components/time/TimePage";

const routes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/board" replace /> },
      { path: "board", element: <BoardPage /> },
      { path: "backlog", element: <BacklogPage /> },
      { path: "notes", element: <NotesPage /> },
      { path: "time", element: <TimePage /> },
    ],
  },
];

export const router = createHashRouter(routes);
