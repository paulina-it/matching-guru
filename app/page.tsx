"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "./types/auth";
import { PulseLoader } from "react-spinners"; // Import a spinner component

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  const handleSignupRedirect = () => {
    router.push("/auth/signup");
  };

  const handleDashboardRedirect = () => {
    if (user?.role === UserRole.ADMIN) {
      router.push("/coordinator");
    } else if (user?.role === UserRole.USER) {
      router.push("/participant");
    }
  };

  useEffect(() => {
    if (user?.id != null) {
      console.log(user);
      console.log(isAuthenticated);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  return (
    <div className="container flex mx-auto gap-14">
      <Header />
      <div>
        <section className="mt-[7em] relative">
          <h2 className="font-semibold text-xl uppercase lg:text-start text-center">Welcome to</h2>
          <h1 className="h1">Matching Guru</h1>
          <p className="my-4 text-center lg:text-start">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus
            numquam ratione molestiae, illo omnis rerum aspernatur tempora
            laborum recusandae iusto tenetur alias, debitis ea commodi accusamus
            aliquid suscipit a rem!Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Ducimus numquam ratione molestiae, illo omnis
            rerum aspernatur tempora laborum recusandae iusto tenetur alias,
            debitis ea commodi accusamus aliquid suscipit a rem!
          </p>
          <div className="flex justify-center">
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
                onClick={handleDashboardRedirect} // Redirects based on role
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </section>
        <div>
          <Image
            src="/assets/ui/MeditatingDoodle.svg"
            priority
            width={1500}
            height={1500}
            alt=""
            className="relative object-contain z-10 m-auto lg:mt-[7em] mt-6"
          />
        </div>
      </div>
    </div>
  );
}
