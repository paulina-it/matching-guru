"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Reusable Label component
const Label = ({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium text-gray-700 block mb-1"
  >
    {children}
  </label>
);

export default function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState("medium");
  const [reminderFrequency, setReminderFrequency] = useState("weekly");

  const [matchStatus, setMatchStatus] = useState(true);
  const [feedback, setFeedback] = useState(true);
  const [reminders, setReminders] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deactivateConfirm, setDeactivateConfirm] = useState("");

  const updatePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    // TODO: Call real API to validate current password and update
    toast.success("Password updated!");
    setCurrentPassword("");
    setNewPassword("");
  };

  const deactivateAccount = () => {
    if (deactivateConfirm === "DEACTIVATE") {
      toast.success("Account deactivated (soft delete)");
      setDeactivateConfirm("");
    } else {
      toast.error("Please type DEACTIVATE to confirm");
    }
  };

  return (
    <div className="min-w-[60vw] bg-light rounded mx-auto p-6 space-y-10">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Theme & Accessibility */}
      <div className="space-y-4">
        <h3 className="font-semibold">Appearance & Accessibility</h3>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>

        <div>
          <Label htmlFor="font-scale">Font Size</Label>
          <select
            id="font-scale"
            value={fontScale}
            onChange={(e) => setFontScale(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="small">Small</option>
            <option value="medium">Default</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="font-semibold">Email Notifications</h3>

        <div className="flex items-center justify-between gap-4">
          <Label>Match Status Updates</Label>
          <Switch checked={matchStatus} onCheckedChange={setMatchStatus} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label>Feedback Received</Label>
          <Switch checked={feedback} onCheckedChange={setFeedback} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label>Reminder Emails</Label>
          <Switch checked={reminders} onCheckedChange={setReminders} />
        </div>

        <div>
          <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
          <select
            id="reminder-frequency"
            value={reminderFrequency}
            onChange={(e) => setReminderFrequency(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
          </select>
        </div>
      </div>

      {/* Update Password */}
      <div className="space-y-2">
        <h3 className="font-semibold">Update Password</h3>
        <Label htmlFor="current-password">Current Password</Label>
        <Input
          id="current-password"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={updatePassword}>Update Password</Button>
      </div>

      {/* Deactivate */}
      <div className="space-y-2">
        <h3 className="font-semibold text-red-600">Deactivate Account</h3>
        <p className="text-sm text-gray-600">
          This is a soft delete. Type <strong>DEACTIVATE</strong> to confirm.
        </p>
        <Input
          placeholder="Type DEACTIVATE"
          value={deactivateConfirm}
          onChange={(e) => setDeactivateConfirm(e.target.value)}
        />
        <Button variant="outline" onClick={deactivateAccount}>
          Deactivate
        </Button>
      </div>
    </div>
  );
}
