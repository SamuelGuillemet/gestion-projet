import { lazy, type ReactNode, Suspense } from "react";
import { createHashRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const BoardPage = lazy(() =>
  import("@/components/board/BoardPage").then((module) => ({
    default: module.BoardPage,
  })),
);

const FocusPage = lazy(() =>
  import("@/components/focus/FocusPage").then((module) => ({
    default: module.FocusPage,
  })),
);

const BacklogPage = lazy(() =>
  import("@/components/backlog/BacklogPage").then((module) => ({
    default: module.BacklogPage,
  })),
);

const NotesPage = lazy(() =>
  import("@/components/notes/NotesPage").then((module) => ({
    default: module.NotesPage,
  })),
);

const TimePage = lazy(() =>
  import("@/components/time/TimePage").then((module) => ({
    default: module.TimePage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
      Chargement...
    </div>
  );
}

function withRouteSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/focus" replace /> },
      { path: "focus", element: withRouteSuspense(<FocusPage />) },
      { path: "board", element: withRouteSuspense(<BoardPage />) },
      { path: "backlog", element: withRouteSuspense(<BacklogPage />) },
      { path: "notes", element: withRouteSuspense(<NotesPage />) },
      { path: "time", element: withRouteSuspense(<TimePage />) },
    ],
  },
];

export const router = createHashRouter(routes);
