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
    setSelectedCourseGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
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
  
  return (
    <form onSubmit={onSubmit} className="bg-light rounded p-5">
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
        {courseGroups.length > 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-0"
            onClick={handleSelectAll}
          >
            Select All
          </Button>
        ) : (
          ""
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
                className="mr-2"
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
