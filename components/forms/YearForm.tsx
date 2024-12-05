"use client";

import React, { useState } from "react";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { AlgorithmType, MatchingCriteriaDto } from "@/app/types/programmes";
import { createProgrammeYear } from "@/app/api/programmes"; 
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";

interface ProgrammeYearFormProps {
  programmeId: number;
  error: string | null;
}

const predefinedCriteria: string[] = [
  "Academic Field",
  "Availability",
  "Personality Fit",
  "Skills",
  "Gender",
  "Age",
  "Nationality",
];

const ProgrammeYearForm: React.FC<ProgrammeYearFormProps> = ({
  programmeId,
  error,
}) => {
  const [academicYear, setAcademicYear] = useState("");
  const [preferredAlgorithm, setPreferredAlgorithm] = useState<AlgorithmType>(
    AlgorithmType.GALE_SHAPLEY
  );
  const [criteria, setCriteria] = useState<MatchingCriteriaDto[]>(
    predefinedCriteria.map((name) => ({ name, weight: 0 }))
  );

  const [loading, setLoading] = useState(true);

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const handleCriteriaChange = (
    index: number,
    field: keyof MatchingCriteriaDto,
    value: string | number
  ) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value,
    };
    setCriteria(updatedCriteria);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalWeight !== 100) {
      toast.error("The total weight must add up to 100.");
      return;
    }

    const formData = {
      programmeId,
      academicYear,
      customSettings: "", 
      preferredAlgorithm,
      matchingCriteria: criteria,
    };

    try {
      setLoading(true);
      await createProgrammeYear(formData);
      toast.success("Programme year created successfully!");
      setAcademicYear("");
      setCriteria(predefinedCriteria.map((name) => ({ name, weight: 0 })));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !programmeId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className="max-w-[50vw] my-10 bg-light rounded p-5">
      <h2 className="text-2xl font-bold mb-4">Create Programme Year</h2>
      {error && <p className="text-red-500">{error}</p>}

      <InputField
        id="academicYear"
        label="Academic Year"
        placeholder="e.g. 2024/2025"
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
        required
      />

      <div className="mb-4">
        <label className="block font-medium text-gray-700 my-2">
          Preferred Algorithm
        </label>
        <select
          value={preferredAlgorithm}
          onChange={(e) =>
            setPreferredAlgorithm(e.target.value as AlgorithmType)
          }
          className="w-full border rounded px-4 py-2"
        >
          <option value={AlgorithmType.GALE_SHAPLEY}>Gale-Shapley</option>
          <option value={AlgorithmType.COLLABORATIVE_FILTERING}>
            Collaborative Filtering
          </option>
          <option value={AlgorithmType.BRACE}>BRACE</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium text-gray-700 my-2">
          Matching Criteria
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Adjust the weights to prioritize specific criteria. The total weight must equal 100.
        </p>
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-4 mb-2">
            <input
              type="text"
              value={criterion.name}
              readOnly
              className="flex-grow border bg-gray-100 rounded px-4 py-2 cursor-not-allowed"
            />
            <input
              type="number"
              placeholder="Weight"
              value={criterion.weight}
              onChange={(e) =>
                handleCriteriaChange(index, "weight", Number(e.target.value))
              }
              className="w-20 border rounded px-4 py-2"
              min="0"
              max="100"
            />
          </div>
        ))}
        <div className="mt-2 text-right text-sm font-medium">
          <p>Total Weight: {totalWeight}</p>
        </div>
      </div>

      <Button type="submit" className="mt-4">
        Create Programme Year
      </Button>
    </form>
  );
};

export default ProgrammeYearForm;
