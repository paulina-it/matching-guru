"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserResponseDto } from "@/app/types/auth";

interface CoursesFormProps {
  user: UserResponseDto | null;
  name: string;
  setName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const CoursesForm: React.FC<CoursesFormProps> = ({
  user,
  name,
  setName,
  onSubmit,
  error,
}) => {
  const [courseGroupFile, setCourseGroupFile] = useState<File | null>(null);
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const handleUpload = async () => {
    if (!courseGroupFile || !courseFile) {
      setUploadStatus("Please upload both files before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("courseGroupFile", courseGroupFile);
    formData.append("courseFile", courseFile);

    try {
      const response = await fetch("/api/upload-courses", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("Files uploaded successfully!");
      } else {
        setUploadStatus("Error uploading files.");
      }
    } catch (error) {
      setUploadStatus("Failed to upload files.");
    }
  };

  return (
    <form className="max-w-[40em] min-w-[30em]" onSubmit={onSubmit}>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          Add Courses at {user?.organisationName}
        </h2>
      </div>
      <div>
        <h2 className="text-xl font-bold text-center mb-4">
          Select Course Groups
        </h2>
        <p className="text-center">
          You can do this manually or upload two files in CSV or XLSX format.
        </p>
        <div className="mt-4">
          <label className="block mb-2 font-medium">Upload Course Groups File</label>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => handleFileChange(e, setCourseGroupFile)}
            className="block w-full mb-4"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Upload Courses File</label>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => handleFileChange(e, setCourseFile)}
            className="block w-full mb-4"
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button type="button" onClick={handleUpload}>
            Upload Files
          </Button>
          {uploadStatus && (
            <p className="text-sm font-medium text-center text-gray-700 mt-2">
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default CoursesForm;
