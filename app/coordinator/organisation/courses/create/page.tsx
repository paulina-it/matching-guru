"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { createCourseGroup, createCourse } from "@/app/api/courses";
import { PulseLoader } from "react-spinners";
import { useRef } from "react";
import { uploadCourseFile } from "@/app/api/upload";

const CourseGroupsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [courseGroups, setCourseGroups] = useState<
    { name: string; type: string; courses: string[] }[]
  >([]);
  const [currentGroup, setCurrentGroup] = useState({
    name: "",
    type: "UNDERGRAD",
    courses: "",
  });
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [entryMode, setEntryMode] = useState<"manual" | "upload" | null>(null);

  const goToNextSlide = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goToPrevSlide = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();

    const coursesArray = currentGroup.courses
      .split("\n")
      .map((course) => course.trim())
      .filter((course) => course.length > 0);

    if (!currentGroup.name || coursesArray.length === 0) {
      toast.error("Please fill in all fields before adding the group.");
      return;
    }

    setCourseGroups((prev) => [
      ...prev,
      {
        name: currentGroup.name,
        type: currentGroup.type,
        courses: coursesArray,
      },
    ]);
    setCurrentGroup({
      name: "",
      type: "UNDERGRAD",
      courses: "",
    });
    toast.success("Course group added successfully!");
  };

  const handleSubmitAllGroups = async () => {
    if (!user?.organisationId) {
      toast.error("Organisation ID is missing. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      for (const group of courseGroups) {
        const createdGroup = await createCourseGroup({
          name: group.name,
          organisationId: user.organisationId,
        });

        for (const course of group.courses) {
          await createCourse({
            name: course,
            type: group.type,
            duration: 3,
            groupId: createdGroup.id,
          });
        }
      }

      toast.success("All course groups and courses submitted successfully!");
      setCourseGroups([]);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting course groups.");
    } finally {
      setLoading(false);
    }
  };
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.organisationId) {
      toast.error("Organisation ID is missing.");
      return;
    }

    try {
      toast.loading("Uploading file...");
      const result = await uploadCourseFile(
        user.organisationId,
        file,
        localStorage.getItem("token") || ""
      );

      toast.dismiss();
      toast.success("File uploaded successfully!");

      console.log("📦 Parsed result:", result);
      // setCourseGroups(result.courseGroups); // if you return them
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="lg:max-w-[40em] max-w-[95vw] mx-auto rounded p-6">
      <Swiper
        onSwiper={setSwiperInstance}
        spaceBetween={50}
        slidesPerView={1}
        allowTouchMove={false}
      >
        {/* Slide 1: Manual or File Upload Selection */}
        <SwiperSlide className="bg-light  dark:bg-dark dark:border dark:border-white/30 rounded-[5px] px-6 py-7">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4">
              How would you like to add courses?
            </h2>
            <p className="mb-6">
              Choose an option below to proceed. You can either add courses
              manually or upload two files in CSV or XLSX format.
            </p>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => {
                  setEntryMode("manual");
                  goToNextSlide();
                }}
              >
                Manual Input
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEntryMode("upload");
                  goToNextSlide();
                }}
              >
                Upload File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .xlsx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </SwiperSlide>

        {entryMode == "manual" ? (
          <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30  rounded-[5px] px-6 py-7">
            <form onSubmit={handleAddGroup}>
              <h2 className="text-xl font-bold text-center mb-4">
                Add Courses at {user?.organisationName}
              </h2>

              <InputField
                id="name"
                label="Course Group Name*"
                value={currentGroup.name}
                onChange={(e) =>
                  setCurrentGroup((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="Enter course group name"
              />

              <div className="mt-2">
                <label className="block text-gray-700 font-medium">
                  Course Type*
                </label>
                <select
                  value={currentGroup.type}
                  onChange={(e) =>
                    setCurrentGroup((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="border rounded w-full px-4 py-2 mt-1"
                  required
                >
                  <option value="UNDERGRAD">Undergraduate</option>
                  <option value="POSTGRAD">Postgraduate</option>
                  <option value="DOCTORAL">Doctoral</option>
                  <option value="APPRENTICESHIP">Apprenticeship</option>
                </select>
              </div>

              <label htmlFor="courses" className="text-gray-700 block mt-4">
                Course Names (one per line)*
              </label>
              <textarea
                id="courses"
                value={currentGroup.courses}
                onChange={(e) =>
                  setCurrentGroup((prev) => ({
                    ...prev,
                    courses: e.target.value,
                  }))
                }
                placeholder="Enter each course on a new line"
                className="border rounded w-full px-4 py-2 mt-2"
                rows={5}
                required
              />

              <div className="flex justify-between items-center mt-6">
                <Button type="button" onClick={goToPrevSlide}>
                  ⬅️ Previous Step
                </Button>
                <Button type="submit">Add Group</Button>
              </div>
            </form>

            {courseGroups.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Added Course Groups</h3>
                <ul className="list-disc list-inside">
                  {courseGroups.map((group, index) => (
                    <li key={index}>
                      <strong>{group.name}</strong> ({group.type}):{" "}
                      {group.courses.length} courses
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  onClick={handleSubmitAllGroups}
                  type="button"
                >
                  Submit All Groups
                </Button>
              </div>
            )}
          </SwiperSlide>
        ) : (
          <SwiperSlide className="bg-light dark:bg-dark dark:border dark:border-white/30  rounded-[5px] px-6 py-7">
            <div className="flex flex-col items-center text-left justify-center m-auto">
              <h2 className="text-2xl font-bold text-center mb-4">
                📁 File Upload Guide
              </h2>

              <p className="mb-4">
                Please prepare <strong>one file</strong> in either{" "}
                <code>.csv</code> or <code>.xlsx</code> format.
              </p>

              <ul className="list-disc pl-6 mb-6">
                <li>
                 Columns:{" "}
                  <code>CourseGroup</code>, <code>Type</code>, and{" "}
                  <code>CourseName</code>.
                </li>
                <li>
                  <strong>CourseGroup</strong> is used to group similar degree
                  programmes (e.g. "Computing", "Engineering").
                </li>
                <li>
                  <strong>CourseName</strong> is the full name of a degree
                  programme (e.g. "BSc Software Engineering").
                </li>
                <li>
                  <strong>Type</strong> should be one of: <code>UNDERGRAD</code>
                  , <code>POSTGRAD</code>, <code>DOCTORAL</code>, or{" "}
                  <code>APPRENTICESHIP</code>.
                </li>
              </ul>

              <p className="mb-6 ">
                Courses will be automatically matched to their respective groups
                by <strong>CourseGroup</strong>. Please make sure the values are
                spelled consistently across rows.
              </p>

              <div className="flex gap-4">
                <Button onClick={goToPrevSlide}>⬅️ Back</Button>
                <Button onClick={handleFileButtonClick}>Upload Files</Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, .xlsx"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default CourseGroupsPage;
