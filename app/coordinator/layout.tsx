"use client";

import DashboardNav from "@/components/DashboardNav";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PulseLoader } from "react-spinners";
import Logout from "@/components/Logout";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const [collapsed, setCollapsed] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    } else if (!loading && isAuthenticated) {
      if (user?.role !== "ADMIN") {
        router.push("/");
      } else {
        setRoleChecked(true);
      }
    }
  }, [isAuthenticated, loading, isAuthPage, user?.role, router]);

  if (loading || !roleChecked) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar (Hidden on smaller screens) */}
      <aside className={`hidden lg:flex bg-primary/50`}>
        <DashboardNav type="coordinator" onCollapse={setCollapsed} />
      </aside>

      {/* Mobile Navigation (Visible on smaller screens) */}
      <div className="lg:hidden w-full absolute">
        <MobileNav type="coordinator"/>
      </div>

      
      <main className={`w-full min-h-screen bg-primary/50 dark:bg-dark flex items-center justify-center relative ${collapsed ? "lg:ml-[4rem]" : "lg:ml-[15rem]"}`}>
        <Logout className=" absolute top-5 right-5 text-accent hover:text-white" />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
