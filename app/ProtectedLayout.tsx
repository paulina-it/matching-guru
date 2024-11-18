"use client";

import { usePathname, useRouter, redirect } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { PulseLoader } from "react-spinners";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage && !isHomePage) {
      redirect("/"); // Redirect if not authenticated and not on allowed pages
    }
  }, [isAuthenticated, loading, isAuthPage, isHomePage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-light">
      <div className="flex-1">
        <PageTransition>{children}</PageTransition>
      </div>
    </main>
  );
}
