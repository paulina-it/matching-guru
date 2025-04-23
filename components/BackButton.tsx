"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const GoBackButton = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); 
  };

  return (
    <Button variant="outline" onClick={handleGoBack} className="absolute top-5 left-5">
      Go Back
    </Button>
  );
};

export default GoBackButton;
