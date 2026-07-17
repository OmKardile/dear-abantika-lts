import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { CycleTracker } from "./pages/CycleTracker";
import { Journal } from "./pages/Journal";
import { Hydration } from "./pages/Hydration";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "cycle", Component: CycleTracker },
      { path: "journal", Component: Journal },
      { path: "hydration", Component: Hydration },
      { path: "settings", Component: Settings },
    ],
  },
]);
