"use client";

import { useState } from "react";
import ProgrammeForm from "@/components/forms/ProgrammeForm";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createProgramme } from "@/app/api/programmes";
import { ProgrammeCreateDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { useRouter } from "next/navigation";

const CreateProgramme = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [contactEmail, setContactEmail] = useState(""); 
  const [selectedCourseGroups, setSelectedCourseGroups] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    if (!name || !desc || !contactEmail || selectedCourseGroups.length === 0) {
      toast.error("All fields are required.");
      return;
    }

    setError(null);

    const programmeData: ProgrammeCreateDto = {
      name,
      description: desc,
      organisationId: user?.organisationId || 0,
      courseGroupIds: selectedCourseGroups,
      contactEmail: contactEmail,
    };

    try {
      const createdProgramme = await createProgramme(programmeData);
      toast.success(
        `Programme "${createdProgramme.name}" created successfully!`
      );
      router.push(`/coordinator/programmes/`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create programme.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="w-[90vw] lg:w-auto lg:min-w-[50vw] mx-auto mt-10">
      <ProgrammeForm
        user={user}
        name={name}
        desc={desc}
        contactEmail={contactEmail} 
        selectedCourseGroups={selectedCourseGroups}
        setName={setName}
        setDesc={setDesc}
        setContactEmail={setContactEmail}
        setSelectedCourseGroups={setSelectedCourseGroups}
        onSubmit={handleSubmit}
        error={error}
        isEditMode={false}
      />
    </div>
  );
};

export default CreateProgramme;
