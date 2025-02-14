"use client";

import DashboardNav from "@/components/DashboardNav";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const ParticipantDashboard = () => {
  const { user } = useAuth();
  console.log(user);

  return (
    <div className="flex justify-between gap-6">
      <div className="bg-light rounded p-10 flex justify-center items-center gap-6">
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
      <div className="bg-light rounded p-10 h-min">
        {user?.organisationName ? (
          <h3 className="h3">
            Organisation:{" "}
            <span className="font-bold">
              {user.organisationName}
              <br />
              Student
            </span>
          </h3>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-700 mb-4">No organisation found.</p>
            <Button
              onClick={() => redirect("participant/organisation")}
              variant="outline"
              className="text-accent hover:text-white"
            >
              Join Organisation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
