"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LogoutProps = {
  className?: string;
};

const Logout: React.FC<LogoutProps> = ({ className }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log("logging out");
    await logout();
    console.log("logged out");
    window.location.href = "/";
  };

  return (
    <Dialog>
      <DialogTrigger 
              className={`border-accent border-[1px] p-3 py-1 rounded hover:border-none hover:bg-accent transition-all duration-200`+className}>Logout</DialogTrigger>
      <DialogContent className="flex justify-center align-center rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to logout?</DialogTitle>
          <DialogDescription className="p-4 flex justify-center align-center">
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Logout;
