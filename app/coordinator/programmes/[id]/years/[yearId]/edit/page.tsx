"use client";

import ProgrammeYearForm from "@/components/forms/YearForm";
import { useParams } from "next/navigation";
import { PulseLoader } from "react-spinners";

const EditYear = () => {
  const { id, yearId } = useParams<{ id: string; yearId: string }>();

  if (!id || !yearId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  return (
    <div>
      <ProgrammeYearForm
        programmeId={parseInt(id, 10)}
        programmeYearId={parseInt(yearId, 10)}
        error={null}
        editMode={true}
      />
    </div>
  );
};

export default EditYear;
