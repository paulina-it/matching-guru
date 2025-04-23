"use client";

import DashboardNav from "@/components/DashboardNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PulseLoader } from "react-spinners";
import Logout from "@/components/Logout";
import { useTheme } from "next-themes";
import MobileNav from "@/components/MobileNav";
import GoBackButton from "@/components/BackButton";

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
      {/* Desktop Sidebar (Hidden on smaller screens) */}
      <aside className={`hidden lg:flex bg-primary/50`}>
        <DashboardNav type="participant" onCollapse={setCollapsed} />
      </aside>

      {/* Mobile Navigation (Visible on smaller screens) */}
      <div className="lg:hidden w-full absolute">
        <MobileNav type="participant" />
      </div>

      <main
        className={`w-full min-h-screen bg-primary/50 dark:bg-dark flex items-center justify-center relative ${
          collapsed ? "lg:ml-[4rem]" : "lg:ml-[15rem]"
        }`}
      >
        <GoBackButton />
        <Logout className=" absolute top-5 right-5 text-accent hover:text-white" />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
