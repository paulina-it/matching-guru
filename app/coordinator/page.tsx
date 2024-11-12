"use client";

import DashboardNav from "@/components/DashboardNav";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  console.log(user);

  return (
    <div className="flex justify-between gap-6">
      <div className="bg-light rounded p-10">
        <h2 className="h2">Hello, {user?.firstName}</h2>
      </div>
      <div className="bg-light rounded p-10">
        <h3 className="h3">Organisation: <span className="font-bold"> {user?.organisationName}</span></h3>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
