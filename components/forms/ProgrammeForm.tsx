"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { fetchCourseGroupsByOrganisationId } from "@/app/api/courses";
import toast from "react-hot-toast";

interface ProgrammeFormProps {
  user: any;
  name: string;
  desc: string;
  selectedCourseGroups: number[]; 
  setSelectedCourseGroups: React.Dispatch<React.SetStateAction<number[]>>;
  setName: (name: string) => void;
  setDesc: (desc: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  isEditMode: boolean;
}

const ProgrammeForm: React.FC<ProgrammeFormProps> = ({
  user,
  name,
  desc,
  selectedCourseGroups,
  setName,
  setDesc,
  setSelectedCourseGroups,
  contactEmail,
  setContactEmail,
  onSubmit,
  error,
  isEditMode,
}) => {
  const [courseGroups, setCourseGroups] = useState<
    { id: number; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.organisationId) return;

      setLoading(true);
      try {
        const groups = await fetchCourseGroupsByOrganisationId(
          user.organisationId
        );
        setCourseGroups(groups);
      } catch (error) {
        console.error("Failed to fetch course groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.organisationId]);

  const handleCourseGroupSelection = (groupId: number) => {
    setSelectedCourseGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    const allGroupIds = courseGroups.map((group) => group.id);
    setSelectedCourseGroups(allGroupIds);
  };

  const handleDeselectAll = () => {
    setSelectedCourseGroups([]);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(contactEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    } 

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-light dark:bg-dark dark:border dark:border-white/30 rounded p-5">
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Edit" : "Create"} Programme</h2>
      {error && <p className="text-red-500">{error}</p>}

      <InputField
        id="name"
        label="Programme Name"
        placeholder="e.g. Business"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="">
        <label htmlFor="desc" className="block font-medium text-gray-700 my-2">
          Programme Description
        </label>
        <textarea
          id="desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Enter a detailed description of the programme"
          className="w-full border rounded px-4 py-2"
          rows={5}
          required
        />
      </div>

      {/* Contact Email Field */}
      <InputField
        id="contactEmail"
        label="Contact Email"
        placeholder="e.g. contact@example.com"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        required
      />

      <div className="relative mt-5">
        <label className="block font-bold mb-2">Select Course Groups</label>
        {courseGroups.length > 1 && (
          <div className="flex justify-end mb-2 absolute top-0 right-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="mr-2"
            >
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
        )}
        {loading ? (
          <p>Loading course groups...</p>
        ) : courseGroups.length > 0 ? (
          courseGroups.map((group) => (
            <div key={group.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedCourseGroups.includes(group.id)}
                onChange={() => handleCourseGroupSelection(group.id)}
                className="mx-3 w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white checked:bg-accent"
              />
              <label>{group.name}</label>
            </div>
          ))
        ) : (
          <p>No course groups available for this organisation.</p>
        )}
      </div>

      <Button type="submit" className="mt-4">
        {isEditMode ? "Update Programme" : "Create Programme"}
      </Button>
    </form>
  );
};

export default ProgrammeForm;
