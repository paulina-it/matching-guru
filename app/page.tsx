"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/auth/login"); 
  };

  const handleSignupRedirect = () => {
    router.push("/auth/signup"); 
  };

  return (
    <div className="container flex mx-auto mt-10 gap-14">
      <div className="">
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
          <Button variant="default" size="xl" className="mr-5"  onClick={handleLoginRedirect}>
            Login
          </Button>
          <Button variant="outline" size="xl"  onClick={handleSignupRedirect}>
            Signup
          </Button>
        </div>
      </div>
      <div className="relative">
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
          width={4000}
          height={4000}
          alt=""
          className="relative object-contain z-10 m-auto"
        />
      </div>
    </div>
  );
}
