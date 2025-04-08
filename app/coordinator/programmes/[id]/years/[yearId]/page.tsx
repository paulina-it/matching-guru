"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { fetchProgrammeById, fetchProgrammeYear } from "@/app/api/programmes";
import { matchParticipants } from "@/app/api/matching";
import { ProgrammeDto, ProgrammeYearDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Progress } from "@/components/ui/progress";
import { formatText } from "@/app/utils/text";
import { Copy, Pencil } from "lucide-react";

const ProgrammeYearPage = () => {
  const params = useParams<{ id: string; yearId: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const programmeId = parseInt(params.id, 10);
  const programmeYearId = parseInt(params.yearId, 10);

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYear, setProgrammeYear] = useState<ProgrammeYearDto | null>(
    null
  );
  const [loadingProgramme, setLoadingProgramme] = useState(true);
  const [matchable, setMatchable] = useState(false);

  useEffect(() => {
    if (!programmeId || !programmeYearId) {
      setLoadingProgramme(false);
      return;
    }

    const fetchProgramme = async () => {
      try {
        const programmeData = await fetchProgrammeById(programmeId);
        const yearData = await fetchProgrammeYear(programmeYearId);
        setProgramme(programmeData);
        setProgrammeYear(yearData);
        const participantCount = yearData.participantCount || 0;
        setMatchable(participantCount < 2);
      } catch (err) {
        toast.error("Error fetching programme details");
      } finally {
        setLoadingProgramme(false);
      }
    };

    fetchProgramme();
  }, [programmeId, programmeYearId]);

  const algorithmMap = {
    GALE_SHAPLEY: "gale-shapley",
    COLLABORATIVE_FILTERING: "collaborative-filtering",
    BRACE: "brace",
  } as const;

  type AlgorithmKey = keyof typeof algorithmMap;

  const handleMatchParticipants = async (
    id: number,
    isInitial: boolean,
    algorithm?: string
  ) => {
    if (!algorithm) {
      toast.error("Matching algorithm is not specified.");
      return;
    }

    const mappedAlgorithm = algorithmMap[algorithm as AlgorithmKey];

    if (!mappedAlgorithm) {
      toast.error("Invalid matching algorithm.");
      return;
    }

    toast.loading("Matching in progress...");

    const result = await matchParticipants(id, isInitial, mappedAlgorithm);

    toast.dismiss();
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  };

  if (loadingProgramme) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <PulseLoader color="#3498db" />
      </div>
    );
  }

  const totalParticipants = programmeYear?.participantCount || 0;
  const unmatchedParticipants = programmeYear?.unmatchedCount || 0;
  const matchedParticipants = totalParticipants - unmatchedParticipants;
  const matchedPercentage = totalParticipants
    ? Math.round((matchedParticipants / totalParticipants) * 100)
    : 0;

  console.log(programmeYear);

  return (
    <div className="max-w-[90vw] lg:max-w-[65vw] bg-light dark:bg-dark dark:border dark:border-white/30 p-6 my-[5em] rounded shadow relative">
      <div className="absolute top-5 right-5 flex gap-5">
        <Button
          variant="outline"
          onClick={() => {
            router.push(`${pathname}/edit`);
          }}
          className="lg:block hidden"
        >
          Edit Cycle
        </Button>
        <Button
          onClick={() => {
            router.push(`${pathname}/participants`);
          }}
          className="lg:block hidden"
        >
          View All Participants
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            router.push(`${pathname}/edit`);
          }}
          className="lg:hidden block"
        >
          <Pencil></Pencil>
        </Button>
      </div>
      <h2 className="h2 font-bold mb-4">{programme?.name ?? "N/A"}</h2>
      <p className="text-gray-700 dark:text-light/90">
        {programme?.description ?? "No description available."}
      </p>
      <div className="flex justify-between">
        <p className="mt-4">Total Participants: {totalParticipants}</p>
        <p className="mt-4">Unmatched Participants: {unmatchedParticipants}</p>
      </div>
      {/* Progress Bar for Matched Percentage */}
      <div className="mt-6">
        <h3 className="h3">Matching Progress</h3>
        <p className="mt-2 text-lg font-semibold">
          {matchedPercentage}% Matched
        </p>
        <Progress value={matchedPercentage} className="w-full h-4 bg-accent" />
      </div>

      <div className="mt-6">
        <h3 className="h3 flex items-center gap-3">
          Programme Year {programmeYear?.academicYear ?? "N/A"}
          {programmeYear?.isActive ? (
            <span className="text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded">
              Active
            </span>
          ) : (
            <span className="text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-300 text-xs font-semibold px-2 py-1 rounded">
              Inactive
            </span>
          )}
        </h3>
        <h2 className="font-semibold mt-2">
          Algorithm: {programmeYear?.preferredAlgorithm ?? "Not specified"}
        </h2>

        <h2 className="mt-2 font-semibold">Matching Criteria</h2>
        {programmeYear?.matchingCriteria &&
        programmeYear.matchingCriteria.length > 0 ? (
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 dark:bg-dark border border-gray-300">
                <th className="px-4 py-2 text-left">Criterion Type</th>
                <th className="px-4 py-2 text-left">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {programmeYear.matchingCriteria.map((criterion, index) =>
                criterion.weight > 0 ? (
                  <tr key={index} className="border border-gray-300">
                    <td className="px-4 py-2">
                      {formatText(criterion.criterionType) ?? "N/A"}
                    </td>
                    <td className="px-4 py-2">{criterion.weight ?? 0}%</td>
                  </tr>
                ) : (
                  ""
                )
              )}
              <tr className="border border-gray-300">
                <td className="px-4 py-2">Academic Stage is</td>
                <td className="px-4 py-2">
                  {programmeYear.strictAcademicStage
                    ? "Strict (Mentor can be one stage above mentee)"
                    : "Soft (Mentor can be any stage above mentee)"}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="px-4 py-2">Course Group is</td>
                <td className="px-4 py-2">
                  {programmeYear.strictCourseGroup
                    ? "Strict (Matching within same group)"
                    : "Soft (Matching between different course groups)"}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 mt-2">No criteria found.</p>
        )}

        <h2 className="h3 mt-5 font-semibold">Matching</h2>

        {/* Display Matching Status */}
        <p className="mt-2 text-lg">
          {programmeYear?.initialMatchingIsDone ? (
            <span className="text-green-600 font-semibold">
              ✅ Matching has already taken place.
            </span>
          ) : (
            <span className="text-red-600 font-semibold">
              ❌ Matching has not yet taken place.
            </span>
          )}
        </p>

        {/* Buttons for Matching Actions */}
        <div className="mt-4 flex gap-4 justify-center lg:justify-start">
          {programmeYear?.initialMatchingIsDone ? (
            <>
              <Button
                onClick={() =>
                  handleMatchParticipants(
                    programmeYearId,
                    !programmeYear?.initialMatchingIsDone,
                    programmeYear.preferredAlgorithm
                  )
                }
              >
                Match Others
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`${pathname}/matches`)}
              >
                View Matches
              </Button>
            </>
          ) : (
            <Button
              onClick={() =>
                handleMatchParticipants(
                  programmeYearId,
                  !programmeYear?.initialMatchingIsDone,
                  programmeYear!.preferredAlgorithm
                )
              }
              variant="outline"
              disabled={matchable}
            >
              Match
            </Button>
          )}
        </div>
        {/* Feedback Survey Info */}
        {programmeYear?.surveyUrl && (
          <div className="mt-8 p-4 border rounded bg-muted/30 dark:bg-muted/10">
            <h3 className="h3 mb-2">Feedback Survey</h3>
            <p className="text-sm mb-2 text-muted-foreground">
              Feedback will be collected from{" "}
              <strong>
                {new Date(programmeYear.surveyOpenDate!).toLocaleString()}
              </strong>{" "}
              to{" "}
              <strong>
                {new Date(programmeYear.surveyCloseDate!).toLocaleString()}
              </strong>
              .
            </p>
            <p className="mt-2">
              <strong>Survey Link: </strong>
              <a
                href={programmeYear.surveyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary-hover"
              >
                {programmeYear.surveyUrl}
              </a>
            </p>
            {programmeYear.feedbackConfirmationCode && (
              <div className="mt-4">
                <p className="font-medium">Feedback Confirmation Code:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm">
                    {programmeYear.feedbackConfirmationCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        programmeYear.feedbackConfirmationCode!
                      );
                      toast.success("Code copied!");
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors"
                    title="Copy code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-sm italic mt-1 text-muted-foreground">
                  Please include this code at the end of your survey, so the
                  participant can verify it on the platform to confirm survey
                  completion.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammeYearPage;
