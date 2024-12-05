"use client";

import DashboardNav from "@/components/DashboardNav";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  console.log(user);

  return (
    <div className="flex justify-between gap-6">
      <div className="bg-light rounded p-10">
        <h2 className="h2">Hello, {user?.firstName} ({user?.role})</h2>
      </div>
      <div className="bg-light rounded p-10">
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
