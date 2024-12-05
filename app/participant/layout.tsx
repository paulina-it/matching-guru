// app/coordinator/layout.tsx (DashboardLayout)
"use client";

import DashboardNav from "@/components/DashboardNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PulseLoader } from "react-spinners"; // Replace with your spinner
import Logout from "@/components/Logout";
import BackButton from "@/components/BackButton";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

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
    <div className="min-h-screen grid grid-cols-[1fr_4fr]">
      <aside>
        <DashboardNav type="participant" />
      </aside>
      <main className="w-full h-full bg-primary/50 flex items-center justify-center relative">
        <Logout className=" absolute top-5 right-5 text-accent hover:text-white" />
        {/* <BackButton className="absolute top-5 left-10 z-10"/> */}
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
