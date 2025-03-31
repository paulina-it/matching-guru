"use client";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ProgrammeCard from "@/components/ProgrammeCard";
import { useState, useEffect } from "react";
import {
  fetchAdminOrganisation,
  createOrganisationAndAssignToUser,
} from "@/app/api/organisation";
import { useAuth } from "@/app/context/AuthContext";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { redirect } from "next/navigation";
import { fetchCourseGroupsByOrganisationId } from "@/app/api/courses";
import { OrganisationResponseDto } from "@/app/types/organisation";
import { uploadOrganisationLogo } from "@/app/api/upload";

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
  const [organisation, setOrganisation] =
    useState<OrganisationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [courseGroups, setCourseGroups] = useState<any[]>([]);
  const [organisationImage, setOrganisationImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    "/assets/ui/logo(yy).png"
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (!user || !user.organisationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAdminOrganisation();
        setOrganisation(data);

        if (data?.id) {
          const courseGroupsData = await fetchCourseGroupsByOrganisationId(
            data.id
          );
          setCourseGroups(courseGroupsData);
        }
      } catch (err) {
        toast.error("Failed to fetch data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = () => {
    if (organisation?.joinCode) {
      navigator.clipboard
        .writeText(organisation.joinCode)
        .then(() => {
          toast.success("Join code copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Failed to copy join code.");
          console.error("Failed to copy text: ", err);
        });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds the 10MB limit.");
        return;
      }

      setOrganisationImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const newOrganisation = await createOrganisationAndAssignToUser({
        name,
        description: desc,
        logoUrl: "",
      });
      
      if (organisationImage && newOrganisation?.id) {
        try {
          const logoUrl = await uploadOrganisationLogo(
            newOrganisation.id,
            organisationImage
          );
          console.log("✅ Logo uploaded successfully:", logoUrl);
          newOrganisation.logoUrl = logoUrl;
        } catch (uploadError) {
          console.error("❌ Logo upload failed:", uploadError);
          toast.error("Logo upload failed");
        }
      }

      setOrganisation(newOrganisation);
    } catch (err) {
      toast.error("Failed to create organisation.");
      console.error("Error creating organisation:", err);
    }
  };

  const handleRedirect = () => {
    redirect("organisation/courses/create");
  };

  if (loading) {
    return <PulseLoader color="#ba5648" size={15} />;
  }

  console.log(organisation);
  return (
    <div className="w-full lg:max-w-[80%] max-w-[90%] m-auto h-full flex items-center justify-center">
      <Toaster position="top-right" />
      {organisation?.id != null ? (
        <div className="bg-light  dark:bg-dark dark:border dark:border-white/30  my-[10vh] p-5 lg:p-12 rounded-[10px]">
          <div className="flex lg:flex-row flex-col-reverse justify-between gap-[3em]">
            <div>
              <h1 className="h1 mb-4">{organisation.name}</h1>
              <p className="mb-5">{organisation.description}</p>
              <h2 className="h3 bg-secondary text-white p-4 rounded flex items-center justify-between">
                Join Code:{" "}
                <span className="font-bold">{organisation.joinCode}</span>
                <Button onClick={handleCopy} className="ml-4 text-sm">
                  Copy
                </Button>
              </h2>
            </div>
            <Image
              src={organisation.logoUrl || "/assets/ui/logo(yy).png"}
              width={200}
              height={200}
              alt="Logo"
              className="m-auto lg:mb-0 mb-[-2em]"
            />
          </div>
          <div className="mt-10 relative">
            <h2 className="h2 text-4xl flex text-start">
              Courses
              <span className="lg:block hidden"> at {organisation?.name}</span>
            </h2>
            <Button
              variant="outline"
              className="absolute lg:top-2 top-0 right-0"
              onClick={handleRedirect}
            >
              Add Courses
            </Button>
            {courseGroups.length > 0 ? (
              <div className="mt-5 grid lg:grid-cols-2 gap-0 lg:gap-6">
                {courseGroups.map((group) => (
                  <div
                    key={group.id}
                    className="lg:mb-8 mb-4 p-4 bg-secondary/10 rounded shadow"
                  >
                    <h3 className="h3 text-xl font-bold mb-2">{group.name}</h3>
                    {group.courses.length > 0 ? (
                      <ul className="list-disc pl-6">
                        {group.courses.map((course: Course) => (
                          <li key={course.id} className="text-gray-700 dark:text-light/75">
                            {course.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">
                        No courses available in this group.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <p>No courses found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <OrganisationForm
          name={name}
          setName={setName}
          setDesc={setDesc}
          desc={desc}
          error={error}
          onSubmit={handleSubmit}
          handleImageChange={handleImageChange}
          previewUrl={previewUrl}
        />
      )}
    </div>
  );
};



export default OrganisationPage;
