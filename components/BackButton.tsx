"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface BackButtonProps {
  fallbackRoute?: string; 
  className: string;
}

const BackButton: React.FC<BackButtonProps> = ({ fallbackRoute = "/", className }) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back(); 
    } else {
      router.push(fallbackRoute); 
    }
  };

  return (
    <Button
      onClick={handleBack}
      className={className}
    >
      ← Back
    </Button>
  );
};

export default BackButton;
