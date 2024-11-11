import DashboardNav from "@/components/DashboardNav";
import React from "react";

const CoordinatorDashboard = () => {
  return (
    <section className="min-h-screen grid grid-cols-[1fr_4fr]">
      <DashboardNav type="coordinator" />
    </section>
  );
};

export default CoordinatorDashboard;
