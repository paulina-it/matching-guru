"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

type Props = {};

const Programmes = (props: Props) => {
  const handleRedirect = () => {
    redirect("programmes/create");
  };
  return (
    <div className="bg-light p-4 rounded min-w-[50vw] relative">
      <h2 className="h2">Programmes</h2>
      <Button
        onClick={handleRedirect}
        variant="outline"
        className="text-accent hover:text-white absolute top-5 right-5"
      >
        Create a programme
      </Button>
      <div>{}</div>
    </div>
  );
};

export default Programmes;
