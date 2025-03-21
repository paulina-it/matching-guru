"use client";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import {
  fetchAdminOrganisation,
  createOrganisationAndAssignToUser,
  fetchOrganisation,
} from "@/app/api/organisation";
import { useAuth } from "@/app/context/AuthContext";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { redirect } from "next/navigation";
import { fetchCourseGroupsByOrganisationId } from "@/app/api/courses";
import { OrganisationResponseDto } from "@/app/types/organisation";

interface Course {
  id: number;
  name: string;
}

interface CourseGroup {
  id: number;
  name: string;
  courses: Course[];
}

const OrganisationPage = () => {
  const [organisation, setOrganisation] = useState<OrganisationResponseDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [courseGroups, setCourseGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organisationId) {
        console.error("User organisation ID is undefined");
        return;
      }

      setLoading(true);
      try {
        const data = await fetchOrganisation(user?.organisationId);
        setOrganisation(data);
      } catch (err) {
        toast.error("Failed to fetch data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <PulseLoader color="#ba5648" size={15} />;
  }

  console.log(organisation);

  return (
    <div className="w-full max-w-[80%] m-auto h-full flex items-center justify-center">
      <Toaster position="top-right" /> {/* Toast container */}
      {organisation?.id != null ? (
        <div className="bg-light my-[10vh] p-12 rounded-[10px]">
          <div className="flex justify-between gap-[3em]">
            <div>
              <h1 className="h1 mb-4">{organisation.name}</h1>
              <p className="mb-5">{organisation.description}</p>
            </div>
            <Image
              src={organisation.logoUrl}
              width={200}
              height={200}
              alt="Logo"
              className="m-auto"
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default OrganisationPage;
