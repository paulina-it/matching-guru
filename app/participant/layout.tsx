"use client";

import DashboardNav from "@/components/DashboardNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PulseLoader } from "react-spinners";
import Logout from "@/components/Logout";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAuthPage = pathname.startsWith("/auth");
  const sidebarWidth = collapsed ? "ml-[4rem]" : "ml-[15rem]";

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, isAuthPage, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white text-black dark:bg-black dark:text-white transition-colors duration-300 relative">
      {/* Sidebar */}
      <aside className="bg-primary/50 dark:bg-zinc-900 transition-colors duration-300">
        <DashboardNav type="participant" onCollapse={setCollapsed} />
      </aside>

      {/* Main content area */}
      <main
        className={`w-full min-h-screen transition-all duration-300 ${sidebarWidth} bg-primary/50 dark:bg-zinc-900 flex items-center justify-center`}
      >
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Fixed Logout Button */}
      <div className="fixed top-5 right-5 z-50">
        <Logout className="text-accent hover:text-white" />
      </div>
    </div>
  );
};

export default DashboardLayout;
