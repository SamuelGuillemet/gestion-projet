import { lazy, type ReactNode, Suspense } from "react";
import { createHashRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectRouteGuard } from "@/components/layout/ProjectRouteGuard";

const BoardPage = lazy(() =>
  import("@/components/board/BoardPage").then((module) => ({
    default: module.BoardPage,
  })),
);

const OverviewPage = lazy(() =>
  import("@/components/focus/OverviewPage").then((module) => ({
    default: module.OverviewPage,
  })),
);

const ActivityReportPage = lazy(() =>
  import("@/components/time/report/ActivityReport").then((module) => ({
    default: module.ActivityReportPage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/components/settings/SettingsPage").then((module) => ({
    default: module.SettingsPage,
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
      { index: true, element: <Navigate to="/dashboard/overview" replace /> },
      {
        path: "dashboard",
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", element: withRouteSuspense(<OverviewPage />) },
          {
            path: "rapport",
            element: withRouteSuspense(<ActivityReportPage />),
          },
          { path: "gestion", element: withRouteSuspense(<SettingsPage />) },
        ],
      },
      {
        path: "project/:projectId",
        element: <ProjectRouteGuard />,
        children: [
          { index: true, element: <Navigate to="board" replace /> },
          { path: "board", element: withRouteSuspense(<BoardPage />) },
          { path: "backlog", element: withRouteSuspense(<BacklogPage />) },
          { path: "notes", element: withRouteSuspense(<NotesPage />) },
          { path: "time", element: withRouteSuspense(<TimePage />) },
        ],
      },
      { path: "*", element: <Navigate to="/dashboard/overview" replace /> },
    ],
  },
];

export const router = createHashRouter(routes);
