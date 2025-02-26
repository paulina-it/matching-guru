"use client";

import DashboardNav from "@/components/DashboardNav";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { redirect } from "next/navigation";
import { joinOrganisation } from "@/app/api/organisation";

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleJoinOrganisation = async () => {
    try {
      console.log("Joining organisation with code:", joinCode);
      await joinOrganisation(joinCode);
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to join organisation:", error);
    }
  };

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
            Organisation: {" "}
            <span className="font-bold">{user.organisationName}</span>
            <br />
            Student
          </h3>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-700 mb-4">No organisation found.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="text-accent hover:text-white">
              Join Organisation
            </Button>
          </div>
        )}
      </div>

      {/* Join Organisation Popup */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Organisation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label htmlFor="joinCode" className="text-sm font-medium">
              Enter Organisation Join Code
            </label>
            <Input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter code..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinOrganisation} className="text-white">
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantDashboard;
