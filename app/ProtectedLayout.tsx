"use client";

import { usePathname, useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/app/api/AuthContext";
import { ReactNode, useEffect } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push("/auth/login"); 
    }
  }, [isAuthenticated, loading, isAuthPage, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="flex min-h-screen">
      {isAuthenticated}
      <div className="flex-1">
        <PageTransition>{children}</PageTransition>
      </div>
    </main>
  );
}
