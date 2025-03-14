"use client";

import DashboardNav from "@/components/DashboardNav";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const CoordinatorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-6 min-h-screen w-[80%] m-auto my-20 lg:my-auto">
      <div className="bg-light rounded p-10 flex justify-center items-center gap-6 w-full">
        {/* Profile Image */}
        <img
          src={user?.profileImageUrl || "/assets/placeholders/avatar.png"}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full shadow-md"
        />
        <div>
          <h2 className="h2">Hello, {user?.firstName}</h2>
          <h3 className="h3 mt-5">({user?.role})</h3>
        </div>
      </div>
      <div className="bg-light rounded p-10 h-min w-full">
        {user?.organisationName ? (
          <h3 className="h3">
            Organisation:{" "}
            <span className="font-bold">{user.organisationName}</span>
          </h3>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-700 mb-4">No organisation found.</p>
            <Button
              onClick={() => redirect("coordinator/organisation")}
              variant="outline"
              className="text-accent hover:text-white"
            >
              Create Organisation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
