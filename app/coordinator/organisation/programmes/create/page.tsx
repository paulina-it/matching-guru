"use client";

import { useState } from "react";
import ProgrammeForm from "@/components/forms/ProgrammeForm";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createProgramme } from "@/app/api/programmes";
import { ProgrammeCreateDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";

const Programmes = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedCourseGroups, setSelectedCourseGroups] = useState<number[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    if (!name || !desc || selectedCourseGroups.length === 0) {
      toast.error("All fields are required.");
      return;
    }

    setError(null);

    const programmeData: ProgrammeCreateDto = {
      name,
      description: desc,
      organisationId: user?.organisationId || 0,
      courseGroupIds: selectedCourseGroups,
    };

    try {
      const createdProgramme = await createProgramme(programmeData);
      toast.success(
        `Programme "${createdProgramme.name}" created successfully!`
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create programme.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[50vw] min-w-[30vw] mx-auto mt-10">
      <ProgrammeForm
        user={user}
        name={name}
        desc={desc}
        selectedCourseGroups={selectedCourseGroups}
        setName={setName}
        setDesc={setDesc}
        setSelectedCourseGroups={setSelectedCourseGroups}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
};

export default Programmes;
