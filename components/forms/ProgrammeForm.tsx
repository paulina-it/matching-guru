"use client";

import React, { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { fetchCourseGroupsByOrganisationId } from "@/app/api/courses";

interface ProgrammeFormProps {
  user: any;
  name: string;
  desc: string;
  selectedCourseGroups: number[];
  setName: (name: string) => void;
  setDesc: (desc: string) => void;
  setSelectedCourseGroups: (groups: number[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const ProgrammeForm: React.FC<ProgrammeFormProps> = ({
  user,
  name,
  desc,
  selectedCourseGroups,
  setName,
  setDesc,
  setSelectedCourseGroups,
  onSubmit,
  error,
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
    setSelectedCourseGroups((prev: number[]) =>
      prev.includes(groupId)
        ? prev.filter((id: number) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    event?.preventDefault();
    const allGroupIds = courseGroups.map((group) => group.id);
    setSelectedCourseGroups(allGroupIds);
  };

  const handleDeselectAll = () => {
    event?.preventDefault();
    setSelectedCourseGroups([]);
  };

  return (
    <form onSubmit={onSubmit} className="w-full bg-light dark:bg-dark dark:border dark:border-white/30  rounded p-5">
      <h2 className="text-2xl font-bold mb-4">Create Programme</h2>
      {error && <p className="text-red-500">{error}</p>}

      <InputField
        id="name"
        label="Programme Name"
        placeholder="e.g. Business"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="mb-4">
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

      <div className="relative">
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
                className="mx-3 w-4 h-4 appearance-none border-2 border-gray-400 rounded bg-white 
  checked:bg-accent checked:border-none checked:ring-2 checked:ring-accent-hover
  focus:outline-none focus:ring-2 focus:ring-accent-hover transition-all cursor-pointer
  relative checked:before:content-['✔'] checked:before:absolute 
  checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 
  checked:before:-translate-y-1/2 checked:before:text-white checked:before:text-md"
              />
              <label>{group.name}</label>
            </div>
          ))
        ) : (
          <p>No course groups available for this organisation.</p>
        )}
      </div>

      <Button type="submit" className="mt-4">
        Create Programme
      </Button>
    </form>
  );
};

export default ProgrammeForm;
