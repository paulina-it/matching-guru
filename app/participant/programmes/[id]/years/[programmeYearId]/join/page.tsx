"use client";

import React, { useEffect, useState } from "react";
import JoinProgrammeForm from "@/components/forms/JoinProgrammeForm";
import { useAuth } from "@/app/context/AuthContext";

const validateParams = (params: {
  programmeYearId?: string;
  id?: string;
}) => {
  console.log(params);
  if (!params.programmeYearId || !params.id) {
    throw new Error("Missing required parameters.");
  }

  const programmeYearId = parseInt(params.programmeYearId, 10);
  const programmeId = parseInt(params.id, 10);

  if (isNaN(programmeYearId) || programmeYearId <= 0) {
    throw new Error("Invalid programmeYearId");
  }

  if (isNaN(programmeId) || programmeId <= 0) {
    throw new Error("Invalid programmeId");
  }

  return { programmeYearId, programmeId };
};

const JoinProgrammePage = ({
  params,
}: {
  params: Promise<{ programmeYearId: string; programmeId: string }>;
}) => {
  const { user, loading } = useAuth();
  const [validatedParams, setValidatedParams] = useState<{
    programmeYearId: number;
    programmeId: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params
      .then((resolvedParams) => {
        try {
          const parsedParams = validateParams(resolvedParams);
          setValidatedParams(parsedParams);
        } catch (err) {
          console.error("Parameter validation failed:", err);
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .catch((err) => {
        console.error("Error resolving params:", err);
        setError("Failed to load parameters.");
      });
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user?.organisationId) {
    return (
      <p className="text-red-500 text-center">
        Not authorized to access this page.
      </p>
    );
  }

  if (!validatedParams) {
    return <p>Loading parameters...</p>;
  }

  const { programmeYearId, programmeId } = validatedParams;

  console.log(user)

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Join Mentoring Programme</h1>
      <JoinProgrammeForm
        programmeYearId={programmeYearId}
        programmeId={programmeId}
        userProp={user}
      />
    </div>
  );
};

export default JoinProgrammePage;
