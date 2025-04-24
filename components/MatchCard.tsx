"use client";

import React from "react";
import { Pencil, Trash, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatText } from "@/app/utils/text";
import { CommunicationLogDto, CommunicationStatus } from "@/app/types/communicationLog";
import toast from "react-hot-toast";
import { UserResponseDto } from "@/app/types/auth";

export interface MatchCardProps {
  match: any;
  index: number;
  isMentor: boolean;
  participant: any;
  user: UserResponseDto | null;
  logs: CommunicationLogDto[];
  sortAvailableDays: (availableDays: string[]) => string[];
  getNextDateForDay: (dayName: string) => string;
  onAccept: () => void;
  onReject: () => void;
  onLogCreate: () => void;
  onLogEdit: (log: CommunicationLogDto) => void;
  onLogDelete: (logId: number) => void;
  onMarkCompleted: (log: CommunicationLogDto) => void;
  shared: { day: string; time: string } | null;
  emailBody: string;
  daysSinceLastInteraction: number | null;
  onOpenNewLogDialog: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  index,
  isMentor,
  participant,
  user,
  logs,
  sortAvailableDays,
  getNextDateForDay,
  onAccept,
  onReject,
  onLogCreate,
  onLogEdit,
  onLogDelete,
  onMarkCompleted,
  shared,
  emailBody,
  daysSinceLastInteraction,
  onOpenNewLogDialog,
}) => {
  const matchStatusInfo = {
    PENDING: { label: "⏳ Pending Coordinator Review", style: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: "✅ Match Approved by Coordinator", style: "bg-green-100 text-green-800" },
    DECLINED: { label: "❌ Declined by Coordinator", style: "bg-red-100 text-red-800" },
    ACCEPTED: { label: "👍 You Accepted the Match", style: "bg-blue-100 text-blue-800" },
    REJECTED: { label: "👎 You Rejected the Match", style: "bg-gray-200 text-gray-600" },
  };

  const statusKey = match.status as keyof typeof matchStatusInfo;
  const statusLabel = matchStatusInfo[statusKey]?.label || "Unknown Status";
  const statusStyle = matchStatusInfo[statusKey]?.style || "bg-gray-100 text-gray-800";

  const person = isMentor ? match.mentee : match.mentor;

  return (
    <div className="mt-8 border p-4 rounded bg-gray-100 dark:bg-dark dark:border dark:border-white/30 text-dark dark:text-white">
      <h4 className="h4 text-lg mb-3 flex justify-between items-center">
        Match #{index + 1}
        <span className={`text-sm px-3 py-1 rounded font-medium ${statusStyle}`}>
          {statusLabel}
        </span>
      </h4>

      <div className="mb-4 p-3 border rounded bg-white dark:bg-light/10 flex flex-col gap-2 sm:gap-3">
        <p><strong>Name:</strong> {person?.firstName} {person?.lastName}</p>
        <p><strong>Email:</strong> {person?.email}</p>
        <p><strong>Course:</strong> {person?.course}</p>
        <p><strong>Academic Stage:</strong> {formatText(person?.academicStage)}</p>
        <p><strong>Available Days:</strong> {person?.availableDays?.join(", ") || "None listed"}</p>
        <p><strong>Skills:</strong> {person?.skills?.join(", ") || "None listed"}</p>
      </div>

      <p className="mt-2"><strong>Compatibility Score:</strong> {match.compatibilityScore}%</p>

      {match.status === "APPROVED" && (
        <div className="flex justify-center gap-4 mt-4">
          <Button size="xl" onClick={onAccept}>Accept Match</Button>
          <Button variant="destructive" size="xl" onClick={onReject}>Reject Match</Button>
        </div>
      )}

      {match.status === "ACCEPTED" && (
        <>
          {shared && (
            <p className="mt-2 text-sm text-muted-foreground">
              🕒 You're both available on <strong>{shared.day}</strong> at <strong>{shared.time}</strong>
            </p>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">Contact Your Match</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suggested Email</DialogTitle>
              </DialogHeader>
              <Textarea readOnly value={emailBody} className="w-full min-h-[20em]" />
              <DialogFooter>
                <Button onClick={() => {
                  const recipient = person?.email;
                  if (!recipient) return toast.error("Match email not found.");
                  const subject = encodeURIComponent("Mentoring Programme: Let's schedule a meeting");
                  const bodyEncoded = encodeURIComponent(emailBody);
                  window.location.href = `mailto:${recipient}?subject=${subject}&body=${bodyEncoded}`;
                }}>
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="default"
            className="w-full sm:w-auto mt-2 sm:mt-0 lg:ml-3 lg:mt-4"
            onClick={onOpenNewLogDialog}
          >
            Log Interaction
          </Button>

          {logs.length === 0 && (
            <p className="text-sm mt-4 italic text-yellow-600">No interactions logged yet.</p>
          )}

          {daysSinceLastInteraction !== null && daysSinceLastInteraction > 14 && (
            <p className="text-accent mt-2 font-medium italic text-sm">
              ⚠️ It's been over 2 weeks since your last logged interaction. Consider reaching out!
            </p>
          )}

          {logs.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-start mb-1 h3">Interaction History</h3>
              <ul className="space-y-2 overflow-x-auto">
                {logs.map((log) => (
                  <li key={log.id} className="text-sm border p-2 rounded flex justify-between">
                    <span>
                      {new Date(log.timestamp).toLocaleString("en-GB")} – <strong>{log.type.replace(/_/g, " ")}</strong> – <em>{log.status}</em>
                    </span>
                    <div className="flex items-center gap-2 ml-4">
                      {log.status !== CommunicationStatus.COMPLETED && (
                        <button onClick={() => onMarkCompleted(log)} className="text-green-600 hover:text-green-800">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => onLogEdit(log)} className="text-primary">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onLogDelete(log.id)} className="text-accent">
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MatchCard;
