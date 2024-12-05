"use client";

import ProgrammeYearForm from "@/components/forms/YearForm";
import {useState} from "react";
import { useParams } from "next/navigation";
import { PulseLoader } from "react-spinners";

type Props = {};

const page = (props: Props) => {
  const { id } = useParams<{ id: string }>(); 
  const programmeId = id ? parseInt(id, 10) : null;
  
  return (
    <div>
      <ProgrammeYearForm
        programmeId={Number(programmeId)}
        // onSubmit={handleSubmit}
        error={null}
      />
    </div>
  );
};

export default page;
