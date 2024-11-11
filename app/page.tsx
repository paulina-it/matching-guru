"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { UserRole } from "./types/auth";

const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  const handleSignupRedirect = () => {
    router.push("/auth/signup");
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, [router]);

  return (
    <div className="container flex mx-auto gap-14">
      <Header />
      <section className="mt-[7em] relative">
        <h2 className="font-semibold text-xl uppercase">Welcome to</h2>
        <h1 className="text-5xl font-accent font-semibold">Matching Guru</h1>
        <p className="my-4">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus
          numquam ratione molestiae, illo omnis rerum aspernatur tempora laborum
          recusandae iusto tenetur alias, debitis ea commodi accusamus aliquid
          suscipit a rem!Lorem ipsum dolor sit, amet consectetur adipisicing
          elit. Ducimus numquam ratione molestiae, illo omnis rerum aspernatur
          tempora laborum recusandae iusto tenetur alias, debitis ea commodi
          accusamus aliquid suscipit a rem!
        </p>
        <div className="flex">
          {!isAuthenticated ? (
            <>
              <Button
                variant="default"
                size="xl"
                className="mr-5"
                onClick={handleLoginRedirect}
              >
                Login
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={handleSignupRedirect}
              >
                Signup
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="xl"
              // onClick={handleDashboardRedirect} // Redirects based on role
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </section>
      <div className="">
        {/* <Image
          src="/assets/ui/shape.png"
          width={2000}
          height={4000}
          alt=""
          className="absolute object-contain overflow-visible z-10"
        /> */}
        <Image
          src="/assets/ui/MeditatingDoodle.svg"
          priority
          width={1500}
          height={1500}
          alt=""
          className="relative object-contain z-10 m-auto mt-[7em]"
        />
      </div>
    </div>
  );
}
