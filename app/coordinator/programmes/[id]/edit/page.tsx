"use client";

import { useState, useEffect } from "react";
import ProgrammeForm from "@/components/forms/ProgrammeForm";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { fetchProgrammeById, updateProgramme } from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeCreateDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { useRouter, useParams } from "next/navigation";

const EditProgramme = () => {
  const { id } = useParams<{ id: string }>();
  const programmeId = id ? parseInt(id, 10) : null; 

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [selectedCourseGroups, setSelectedCourseGroups] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!programmeId) {
      setError("Invalid programme ID");
      return;
    }

    const fetchProgramme = async () => {
      try {
        const data = await fetchProgrammeById(programmeId);
        setProgramme(data);
        setName(data.name);
        setDesc(data.description);
        setContactEmail(data.contactEmail || ""); 
        setSelectedCourseGroups(data.courseGroupIds);
      } catch (error) {
        toast.error("Failed to load programme details.");
      }
    };

    fetchProgramme();
  }, [programmeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    if (!name || !desc || !contactEmail || selectedCourseGroups.length === 0) {
      toast.error("All fields are required.");
      setLoading(false);
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

    if (!programmeId) return;

    try {
      const updatedProgramme = await updateProgramme(programmeId, programmeData);
      toast.success(`Programme "${updatedProgramme.name}" updated successfully!`);
      router.push(`/programmes/${programmeId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update programme.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !programme) {
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
        isEditMode={true}
      />
    </div>
  );
};

export default EditProgramme;
