"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { assignUserToOrganisation } from "@/app/api/users";

interface Props {
  currentUser: { id: number; organisationId: number };
  onSuccess?: () => void;
}

const InviteOrAssignCoordinatorDialog: React.FC<Props> = ({
  currentUser,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"invite" | "assign">("invite");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  if (!currentUser) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!email) return;

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      if (mode === "invite") {
        const query = new URLSearchParams({
          organisationId: currentUser.organisationId.toString(),
          email,
          createdByUserId: currentUser.id.toString(),
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invites/create?${query.toString()}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Invite failed");

        const data = await res.json();
        const inviteLink = `${window.location.origin}/auth/signup?invite=${data.token}`;
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Invite link copied to clipboard!");
      } else {
        console.log(email);
        await assignUserToOrganisation(email, currentUser.organisationId);
        toast.success("User assigned successfully!");
      }

      setEmail("");
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="absolute -top-[3em] right-0">
          ➕ Add Coordinator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "invite"
              ? "Invite New Coordinator"
              : "Assign Existing Coordinator"}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          {mode === "invite"
            ? "Send a secure invite link to a new coordinator. Link expires in 7 days."
            : "Add an existing coordinator (already signed up) to this organisation."}
        </div>

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="coordinator@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 mb-4 absolute -top-[2.2em] right-0">
          <Button
            variant={mode === "invite" ? "default" : "white"}
            onClick={() => setMode("invite")}
          >
            Invite New
          </Button>
          <Button
            variant={mode === "assign" ? "default" : "white"}
            onClick={() => setMode("assign")}
          >
            Add Existing
          </Button>
        </div>

        <DialogFooter>
          <Button disabled={loading || !email} onClick={handleSubmit}>
            {loading
              ? "Processing..."
              : mode === "invite"
              ? "Send Invite"
              : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteOrAssignCoordinatorDialog;
