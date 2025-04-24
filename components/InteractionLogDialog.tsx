"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommunicationStatus, CommunicationType } from "@/app/types/communicationLog";

interface InteractionLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLogId: number | null;
  type: CommunicationType;
  setType: (value: CommunicationType) => void;
  status: CommunicationStatus;
  setStatus: (value: CommunicationStatus) => void;
  timestamp: string;
  setTimestamp: (value: string) => void;
  onSubmit: () => void;
}

const InteractionLogDialog: React.FC<InteractionLogDialogProps> = ({
  open,
  onOpenChange,
  editingLogId,
  type,
  setType,
  status,
  setStatus,
  timestamp,
  setTimestamp,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="dialog" aria-modal="true" aria-labelledby="log-title">
        <DialogHeader>
          <DialogTitle id="log-title">
            {editingLogId ? "Edit" : "Log"} Interaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            Type:
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CommunicationType)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              {Object.values(CommunicationType).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            Status:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CommunicationStatus)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              {Object.values(CommunicationStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="timestamp" className="block">
            Timestamp:
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              id="timestamp"
              aria-labelledby="timestamp-label"
              aria-required="true"
            />
          </label>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit}>
            {editingLogId ? "Update Log" : "Save Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionLogDialog;
