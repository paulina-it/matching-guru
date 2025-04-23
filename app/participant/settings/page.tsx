"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const Label = ({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
  >
    {children}
  </label>
);

export default function SettingsPanel() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [fontScale, setFontScale] = useState("medium");

  const [reminderFrequency, setReminderFrequency] = useState("weekly");
  const [matchStatus, setMatchStatus] = useState(true);
  const [feedback, setFeedback] = useState(true);
  const [reminders, setReminders] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deactivateConfirm, setDeactivateConfirm] = useState("");

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const saved = localStorage.getItem("fontScale");
    if (saved) {
      setFontScale(saved);
      applyFontScale(saved);
    }
  }, []);

  const applyFontScale = (scale: string) => {
    const html = document.documentElement;
    html.classList.remove("text-sm", "text-base", "text-lg", "text-xl", "text-2xl");

    const classToAdd =
      scale === "small"
        ? "text-sm"
        : scale === "large"
        ? "text-lg"
        : scale === "xl"
        ? "text-2xl"
        : "text-base";

    html.classList.add(classToAdd);
    localStorage.setItem("fontScale", scale);
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? "dark" : "light");
  };

  const updatePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

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
    <div
      className="min-w-[60vw] mt-[5em] bg-light dark:bg-zinc-900 text-black dark:text-white rounded mx-auto p-6 space-y-10 transition-colors dark:border dark:border-white/30"
      role="region"
      aria-labelledby="settings-heading"
    >
      <h2 id="settings-heading" className="text-2xl font-bold">Settings</h2>

      {/* Theme & Accessibility */}
      <section aria-labelledby="appearance-heading" className="space-y-4">
        <h3 id="appearance-heading" className="font-semibold">Appearance & Accessibility</h3>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <Switch
            id="dark-mode"
            role="switch"
            aria-checked={isDark}
            checked={isDark}
            onCheckedChange={handleThemeToggle}
            aria-label="Toggle dark mode"
          />
        </div>

        <div>
          <Label htmlFor="font-scale">Font Size</Label>
          <select
            id="font-scale"
            value={fontScale}
            onChange={(e) => {
              const value = e.target.value;
              setFontScale(value);
              applyFontScale(value);
            }}
            className="w-full border rounded px-3 py-2 mt-1"
            aria-label="Select font size"
          >
            <option value="small">Small</option>
            <option value="medium">Default</option>
            <option value="large">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section aria-labelledby="notifications-heading" className="space-y-4">
        <h3 id="notifications-heading" className="font-semibold">Email Notifications</h3>

        <div className="flex items-center justify-between gap-4">
          <Label>Match Status Updates</Label>
          <Switch
            role="switch"
            aria-checked={matchStatus}
            checked={matchStatus}
            onCheckedChange={setMatchStatus}
            aria-label="Match status email updates"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label>Feedback Received</Label>
          <Switch
            role="switch"
            aria-checked={feedback}
            checked={feedback}
            onCheckedChange={setFeedback}
            aria-label="Feedback received email alerts"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label>Reminder Emails</Label>
          <Switch
            role="switch"
            aria-checked={reminders}
            checked={reminders}
            onCheckedChange={setReminders}
            aria-label="Reminder email notifications"
          />
        </div>

        <div>
          <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
          <select
            id="reminder-frequency"
            value={reminderFrequency}
            onChange={(e) => setReminderFrequency(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            aria-label="Set reminder frequency"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
          </select>
        </div>
      </section>

      {/* Update Password */}
      <section aria-labelledby="password-heading" className="space-y-2">
        <h3 id="password-heading" className="font-semibold">Update Password</h3>
        <Label htmlFor="current-password">Current Password</Label>
        <Input
          id="current-password"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          aria-required="true"
        />
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          aria-required="true"
        />
        <Button variant="outline" onClick={updatePassword}>
          Update Password
        </Button>
      </section>

      {/* Deactivate Account */}
      {/* <section aria-labelledby="deactivate-heading" className="space-y-2">
        <h3 id="deactivate-heading" className="font-semibold text-red-600">Deactivate Account</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This is a soft delete. Type <strong>DEACTIVATE</strong> to confirm.
        </p>
        <Input
          aria-label="Confirm deactivation"
          placeholder="Type DEACTIVATE"
          value={deactivateConfirm}
          onChange={(e) => setDeactivateConfirm(e.target.value)}
        />
        <Button variant="outline" onClick={deactivateAccount}>
          Deactivate
        </Button>
      </section> */}
    </div>
  );
}
