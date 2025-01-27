"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import { fetchCourseGroupsByOrganisationId } from "@/app/api/courses";
import Link from "next/link";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";

const predefinedCriteria = [
  { id: 1, label: "Academic field" },
  { id: 2, label: "Availability" },
  { id: 3, label: "Personality fit" },
  { id: 4, label: "Skills and Experience" },
  { id: 5, label: "Demographics" },
];

// Define the prop types
interface CourseGroup {
  id: number;
  name: string;
}

interface CriteriaWeight {
  id: number;
  weight: number;
}

interface ProgrammeFormProps {
  user: { organisationId: number }; // Replace with your actual `user` type
  onSubmit: (programmeData: {
    name: string;
    desc: string;
    selectedCourseGroups: number[];
    matchingCriteria: CriteriaWeight[];
  }) => void;
  error?: string; // Optional error message
}

const ProgrammeForm: React.FC<ProgrammeFormProps> = ({
  user,
  onSubmit,
  error,
}) => {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [selectedCourseGroups, setSelectedCourseGroups] = useState<number[]>(
    []
  );
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [criteriaWeights, setCriteriaWeights] = useState<CriteriaWeight[]>(
    predefinedCriteria.map((criterion) => ({ id: criterion.id, weight: 0 }))
  );
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  const totalWeight = criteriaWeights.reduce((sum, c) => sum + c.weight, 0);
  const [inactive, setInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    if (!user?.organisationId) return;
    try {
      setLoading(true);
      const groups = await fetchCourseGroupsByOrganisationId(
        user.organisationId
      );
      setCourseGroups(groups);
      if (groups.length <= 0) {
        setInactive(true);
      }
    } catch (err) {
      console.error("Failed to fetch course groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.organisationId]);

  const handleCourseGroupSelection = (groupId: number) => {
    setSelectedCourseGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleCriteriaWeightChange = (id: number, weight: number) => {
    setCriteriaWeights((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight } : c))
    );
  };

  const goToNextSlide = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goToPrevSlide = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      toast.error("The total weight of all criteria must add up to 100%");
      return;
    }

    const programmeData = {
      name,
      desc,
      selectedCourseGroups,
      matchingCriteria: criteriaWeights,
    };

    onSubmit(programmeData);
  };

  if (loading) {
    return <PulseLoader color="#ba5648" size={15} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Swiper
        onSwiper={setSwiperInstance}
        allowTouchMove={false}
        className="w-full"
      >
        {/* Slide 1: Basic Programme Info + Course Groups */}
        <SwiperSlide className="bg-light p-10 rounded">
          <h2 className="text-2xl font-bold mb-4">
            Basic Programme Information
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <strong>
            <InputField
              id="name"
              label="Programme Name"
              placeholder="e.g. Business"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </strong>

          <div className="mb-4">
            <label
              htmlFor="desc"
              className="block font-bold text-gray-700 my-2"
            >
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

          <div className="mb-4">
            <label className="block font-bold text-gray-700 my-2">
              Select Eligible Groups
            </label>
            {courseGroups.length > 0 ? (
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
              <p>
                No course groups available for this organisation.{" "}
                <Link
                  href="/coordinator/organisation/courses/create"
                  className="font-bold hover:underline transition-all duration-200"
                >
                  Please add them here{" "}
                </Link>
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={goToNextSlide} disabled={inactive}>
              Next
            </Button>
          </div>
        </SwiperSlide>

        {/* Slide 2: Matching Criteria */}
        <SwiperSlide className="bg-light p-10 rounded">
          <h2 className="text-2xl font-bold mb-4">Matching Criteria</h2>
          <p>
            Please assign a weight to each criterion (0–100%). The total weight
            must equal 100%.
          </p>
          <div className="my-4">
            {predefinedCriteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center mb-2">
                <label className="flex-grow font-bold">{criterion.label}</label>
                <input
                  type="number"
                  value={
                    criteriaWeights.find((c) => c.id === criterion.id)
                      ?.weight || 0
                  }
                  onChange={(e) =>
                    handleCriteriaWeightChange(
                      criterion.id,
                      Math.max(0, Math.min(100, Number(e.target.value)))
                    )
                  }
                  className="border rounded px-2 py-1 w-20"
                  min={0}
                  max={100}
                />
                <span className="ml-2">%</span>
              </div>
            ))}
          </div>
          <p
            className={`my-2 ${
              totalWeight !== 100 ? "text-red-500" : "text-green-500"
            }`}
          >
            Total Weight: {totalWeight}%
          </p>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goToPrevSlide}>
              Previous
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ProgrammeForm;
