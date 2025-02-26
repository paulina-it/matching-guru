"use client";

import DashboardNav from "@/components/DashboardNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PulseLoader } from "react-spinners";
import Logout from "@/components/Logout";
import BackButton from "@/components/BackButton";

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
      <aside className=" bg-primary/50">
        <DashboardNav type="coordinator"  onCollapse={setCollapsed} />
      </aside>
      <main className={`w-full min-h-screen bg-primary/50 flex items-center justify-center relative ${collapsed ? "ml-[4rem]" : "ml-[15rem]"}`}>
        <Logout className=" absolute top-5 right-5 text-accent hover:text-white" />
        {/* <BackButton className="absolute top-5 left-10 z-10"/> */}
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
