"use client";

import { useEffect, useState } from "react";
import { fetchParticipantDashboard } from "@/app/api/dashboard";
import { MatchSummaryDto, ParticipantDashboardDto } from "../types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  downloadServerCertificate,
  verifyFeedbackCode,
} from "../api/programmes";
import { PulseLoader } from "react-spinners";

const ParticipantDashboard = () => {
  const [data, setData] = useState<ParticipantDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const [unconfirmedCount, setUnconfirmedCount] = useState<number>();
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [confirmationCodeInput, setConfirmationCodeInput] = useState("");
  const [codeIsValid, setCodeIsValid] = useState(false);
  const [activeProgrammeYearId, setActiveProgrammeYearId] = useState<
    number | null
  >(null);
  const [activeParticipantId, setActiveParticipantId] = useState<number | null>(
    null
  );

  const handleConfirmCode = async () => {
    if (!activeParticipantId || !activeProgrammeYearId) return;

    try {
      const isValid = await verifyFeedbackCode(
        confirmationCodeInput,
        activeParticipantId,
        activeProgrammeYearId
      );
      if (isValid) {
        toast.success("Code verified successfully.");
        setCodeIsValid(true);
      } else {
        toast.error(
          "Invalid confirmation code. Please double-check and try again."
        );
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error("Something went wrong verifying the code.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    console.log(user);

    fetchParticipantDashboard()
      .then((data) => {
        setData(data);
        const count = data.matches.filter(
          (m: MatchSummaryDto) => m.status.toUpperCase() === "PENDING"
        ).length;
        setUnconfirmedCount(count);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return;
  <div className="flex justify-center items-center h-screen">
    <PulseLoader color="#ba5648" size={15} />
  </div>;

  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  return (
    <div
      aria-label="Participant Dashboard"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-dark dark:border-white dark:border rounded p-4 mt-[5em] sm:p-6 lg:p-8 w-full max-w-[90%] mx-auto"
    >
      <div
        aria-label="Profile Overview"
        className="col-span-2 p-6 bg-primary/5 dark:bg-dark rounded flex dark:border-white dark:border "
      >
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={`${user.firstName} ${user.lastName} profile photo`}
            className="w-24 h-24 rounded-full object-cover shadow-md mr-10"
          />
        ) : (
          <div
            aria-hidden="true"
            className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-semibold mr-10"
          >
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organisation: <strong>{user?.organisationName}</strong>
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Warnings */}
      <div
        aria-label="Notifications"
        className="lg:col-span-1 col-span-2 bg-primary/5 dark:bg-dark rounded p-6 dark:border-white dark:border "
      >
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        {/* 🔔 Unconfirmed Matches */}
        {Object.entries(
          data.matches
            .filter((m) => m.status.toUpperCase() === "PENDING")
            .reduce((acc, m) => {
              const key = `${m.programmeId}-${m.programmeYearId}`;
              if (!acc[key]) acc[key] = { ...m, count: 1 };
              else acc[key].count += 1;
              return acc;
            }, {} as Record<string, MatchSummaryDto & { count: number }>)
        ).map(([key, group]) => (
          <div key={key} className="mb-2">
            <p>
              🔔 You have <span className="font-bold">{group.count}</span>{" "}
              unconfirmed match
              {group.count > 1 ? "es" : ""} in{" "}
              <span className="font-medium">
                {group.programmeName} ({group.academicYear})
              </span>
            </p>
            <span className="text-sm text-dark/70 italic">
              Please wait for a coordinator to approve them.
            </span>
            <Button
              variant="link"
              className="w-full sm:w-fit mt-2 sm:mt-0"
              onClick={() =>
                router.push(
                  `/participant/programmes/${group.programmeId}/years/${group.programmeYearId}/my-details`
                )
              }
            >
              View match details
            </Button>
          </div>
        ))}

        {/* Communication Logs */}
        {data.matches
          .filter(
            (m) =>
              m.status.toUpperCase() === "APPROVED" &&
              m.lastInteractionDate &&
              new Date(m.lastInteractionDate).getTime() <
                Date.now() - 14 * 24 * 60 * 60 * 1000
          )
          .map((m) => (
            <div key={m.matchId} className="mb-2" aria-label="Call to action">
              <p>
                💬 It's been over 2 weeks since you logged communication in{" "}
                <span className="font-medium">
                  {m.programmeName} ({m.academicYear})
                </span>
              </p>
              <Button
                variant="link"
                className="w-full sm:w-fit mt-2 sm:mt-0"
                onClick={() =>
                  router.push(
                    `/participant/programmes/${m.programmeId}/years/${m.programmeYearId}/my-details`
                  )
                }
              >
                Log interaction
              </Button>
            </div>
          ))}

        {/* 📝 Pending Feedback */}
        {data.activeParticipations
          .filter(
            (p) => !p.feedbackSubmitted && p.surveyUrl && p.surveyCloseDate
          )
          .map((p) => (
            <div
              key={p.programmeYearId}
              className="mb-2"
              aria-label="Pending Feedback"
            >
              <p>
                📝 Feedback pending for{" "}
                <span className="font-medium">
                  {p.programmeName} ({p.academicYear})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Please complete the survey by{" "}
                <strong>
                  {new Date(p.surveyCloseDate!).toLocaleDateString()}
                </strong>{" "}
                to receive your certificate of participation.
              </p>
              <Button
                aria-label="Open feedback survey"
                variant="link"
                className="w-full sm:w-fit mt-2 sm:mt-0"
                onClick={() => window.open(p.surveyUrl, "_blank")}
              >
                Fill out feedback survey
              </Button>
              <Dialog open={openCodeDialog} onOpenChange={setOpenCodeDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="w-full sm:w-fit mt-2 sm:mt-0"
                    onClick={() => {
                      setActiveProgrammeYearId(p.programmeYearId);
                      setActiveParticipantId(p.participantId);
                      setOpenCodeDialog(true);
                    }}
                    aria-label="Open dialog to enter confirmation code"
                  >
                    Enter confirmation code
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="rounded"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="Feedback Confirmation Code Entry"
                  aria-describedby="Paste the code you received after completing the feedback survey."
                >
                  <DialogHeader>
                    <DialogTitle>
                      {codeIsValid
                        ? "✅ Code Verified"
                        : "Enter Confirmation Code"}
                    </DialogTitle>
                    <DialogDescription>
                      {codeIsValid ? (
                        <p className="text-green-600 font-medium mt-2">
                          Thank you! The code is valid.
                          <br />
                          You can now access your certificate below.
                        </p>
                      ) : (
                        "Paste the code you received after completing the feedback survey."
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {!codeIsValid ? (
                    <>
                      <Input
                        value={confirmationCodeInput}
                        onChange={(e) =>
                          setConfirmationCodeInput(e.target.value)
                        }
                        placeholder="e.g. 6e152370-1111-4888-a27d-c93b1f09efaf"
                        className="mt-4"
                      />

                      <DialogFooter>
                        <Button onClick={() => handleConfirmCode()}>
                          Confirm Code
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="default"
                        className="w-full sm:w-fit mt-2 sm:mt-0"
                        onClick={() =>
                          downloadServerCertificate(
                            `${user?.firstName} ${user?.lastName}`,
                            p.role.toLowerCase(),
                            p.programmeName,
                            p.academicYear,
                            new Date().toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          )
                        }
                      >
                        Download Certificate
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ))}

        {data.matches.filter(
          (m) =>
            m.status.toUpperCase() === "PENDING" ||
            (m.status.toUpperCase() === "APPROVED" &&
              m.lastInteractionDate &&
              new Date(m.lastInteractionDate).getTime() <
                Date.now() - 14 * 24 * 60 * 60 * 1000)
        ).length === 0 &&
          data.activeParticipations.filter(
            (p) => !p.feedbackSubmitted && p.surveyUrl && p.surveyCloseDate
          ).length === 0 && (
            <div className="text-center mt-6 text-muted-foreground">
              <p className="text-md mb-2">You're all caught up!</p>
              <Button
                variant="outline"
                className="w-full sm:w-fit mt-2 sm:mt-0"
                onClick={() => router.push("/participant/programmes")}
              >
                Browse available programmes
              </Button>
            </div>
          )}
      </div>

      {/* Match Summary */}
      <div
        aria-label="Confirmed Matches"
        className="bg-primary/5 dark:bg-dark rounded p-6 dark:border-white dark:border w-full lg:col-span-1 col-span-2"
      >
        <h2 className="text-xl font-semibold mb-4">Matches Overview</h2>
        {data.matches.length === 0 ? (
          <p>No matches yet.</p>
        ) : (
          data.matches
            .filter((m) => m.status == "APPROVED")
            .map((m) => (
              <div key={m.matchId} className="mb-4 border-b pb-2">
                <p className="font-semibold">
                  {m.mentor ? "Mentor to" : "Mentee of"} {m.matchWithName} (
                  {m.matchWithEmail})
                </p>
                <p className="text-sm text-muted-foreground">
                  Programme: {m.programmeName} ({m.academicYear})<br />
                  Status: {m.status} | Compatibility:{" "}
                  {m.compatibilityScore || "N/A"}
                </p>
                {m.lastInteractionDate && (
                  <p className="text-xs text-gray-500">
                    Last Interaction:{" "}
                    {new Date(m.lastInteractionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Participations */}
      <div  aria-label="Your programmes" className="bg-primary/5 dark:bg-dark rounded p-6 col-span-2 dark:border-white dark:border">
        <h2 className="text-xl font-semibold mb-4">Your Programmes</h2>
        {data.matches.length === 0 ? (
          <p>You have not participated in any programmes yet.</p>
        ) : (
          data.activeParticipations.map((p) => (
            <div
              key={p.programmeYearId}
              className="mb-3 flex flex-col lg:flex-row justify-between"
            >
              <div>
                <p className="font-bold">
                  {p.programmeName} ({p.academicYear})
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: {p.role}, Matched: {p.matched ? "✅" : "❌"} <br />
                  {/* Feedback:{" "} {p.feedbackSubmitted ? "✅" : "❌"} */}
                </p>
              </div>
              <Button
                className="w-full sm:w-fit mt-2 sm:mt-0"
                onClick={() => {
                  router.push(
                    `participant/programmes/${p.programmeId}/years/${p.programmeYearId}/my-details`
                  );
                }}
              >
                View Details
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
