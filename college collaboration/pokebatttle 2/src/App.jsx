import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/Navbar";
import BackgroundFX from "@/components/BackgroundFX";
import Landing from "@/pages/Landing";
import Select from "@/pages/Select";
import Battle from "@/pages/Battle";
import { GameProvider } from "@/context/GameContext";

const RootLayout = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-red-500/30 flex flex-col relative">
      <BackgroundFX />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 z-10 flex flex-col">
        <Outlet />
      </main>
      <Analytics />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/select", element: <Select /> },
      { path: "/battle", element: <Battle /> },
    ],
  },
]);

export default function App() {
  return (
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  );
}
