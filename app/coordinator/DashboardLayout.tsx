"use client";

import { usePathname, useRouter } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import { PulseLoader } from "react-spinners"; // or another spinner component
import Logout from "@/components/Logout";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    setHydrated(true);
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, isAuthPage, router]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen grid grid-cols-[1fr_4fr]">
      <aside>
        <DashboardNav type="coordinator" />
      </aside>
      <main className="w-full h-full bg-primary flex items-center justify-center">
        <Logout className=" absolute top-5 right-5 text-accent hover:text-white" />
        {loading ? (
          <PulseLoader color="#ba5648" size={15} />
        ) : (
          <PageTransition>{children}</PageTransition>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
