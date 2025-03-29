"use client";

import DashboardNav from "@/components/DashboardNav";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <div className="grid grid-cols-2 gap-6">
      {/* Profile Overview */}
      <div className="bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-10 flex justify-center items-center gap-6">
        <img
          src={user?.profileImageUrl || "/assets/placeholders/avatar.png"}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full shadow-md"
        />
        <div>
          <h2 className="h2">Hello, {user?.firstName}</h2>
          <h3 className="h3 mt-3">({user?.role})</h3>
          {user?.personalityType && (
            <p className="text-gray-600 mt-2">
              Personality: {user.personalityType}
            </p>
          )}
        </div>
      </div>

      {/* Organisation & Programme Status */}
      <div className="bg-light dark:bg-dark dark:border dark:border-white/30  rounded p-10">
        {user?.organisationName ? (
          <h3 className="h3">
            Organisation:{" "}
            <span className="font-bold">{user.organisationName}</span>
          </h3>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-700 mb-4">No organisation found.</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="text-accent hover:text-white"
            >
              Join Organisation
            </Button>
          </div>
        )}
      </div>

      {/* Mentorship Status */}
      <div className="bg-light dark:bg-dark dark:border dark:border-white/30  rounded p-10">
        <h3 className="h3 mb-4">Recent Participations</h3>
        {/* {user?.participations?.length > 0 ? (
          user.participations.map((participation, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <h4 className="font-bold">{participation.programmeName}</h4>
              <p className="text-gray-700">
                {participation.isMentor && <span>🌟 Mentor</span>}
                {participation.isMentee && <span> 📚 Mentee</span>}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-700">You are not currently participating in any mentorships.</p>
        )} */}
      </div>

      {/* Meetings & Calendar */}
      <div className="bg-light dark:bg-dark dark:border dark:border-white/30  rounded p-10">
        <h3 className="h3 mb-4">Upcoming Meetings</h3>
        {/* {user?.meetings?.length > 0 ? (
          user.meetings.map((meeting, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <h4 className="font-bold">{meeting.title}</h4>
              <p className="text-gray-700">{meeting.date} at {meeting.time}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No scheduled meetings.</p>
        )} */}
      </div>

      {/* Notifications & Updates */}
      {/* <div className="bg-light rounded p-10">
        <h3 className="h3 mb-4">Notifications</h3>
        {user?.notifications?.length > 0 ? (
          user.notifications.map((notification, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <p className="text-gray-700">{notification.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No new notifications.</p>
        )}
      </div> */}

      {/* Feedback & Review */}
      <div className="bg-light  dark:bg-dark dark:border dark:border-white/30 rounded p-10">
        <h3 className="h3 mb-4">Feedback & Reviews</h3>
        {/* {user?.feedback?.length > 0 ? (
          user.feedback.map((review, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <h4 className="font-bold">{review.mentorName || "Anonymous"}</h4>
              <p className="text-gray-700">"{review.comment}"</p>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No feedback available.</p>
        )} */}
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
