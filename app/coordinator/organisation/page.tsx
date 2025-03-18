"use client";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

type OrganisationData = {
  id: number;
  name: string;
  description: string;
  joinCode: string;
};
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
  const [organisation, setOrganisation] = useState<OrganisationData | null>(
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
      setLoading(true);
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
      });
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

  return (
    <div className="w-full lg:max-w-[80%] max-w-[90%] m-auto h-full flex items-center justify-center">
      <Toaster position="top-right" /> 
      {organisation?.id != null ? (
        <div className="bg-light my-[10vh] p-5 lg:p-12 rounded-[10px]">
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
              src="/assets/ui/logo(yy).png"
              width={200}
              height={200}
              alt="Logo"
              className="m-auto lg:mb-0 mb-[-2em]"
            />
          </div>
          <div className="mt-10 relative">
            <h2 className="h2 text-4xl lg:text-center text-start">
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
                          <li key={course.id} className="text-gray-700">
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
        />
      )}
    </div>
  );
};

interface FormProps {
  name: string;
  desc: string;
  error: string | null;
  setName: (name: string) => void;
  setDesc: (desc: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const OrganisationForm: React.FC<FormProps> = ({
  name,
  desc,
  error,
  setName,
  setDesc,
  onSubmit,
}) => (
  <form
    className="max-w-[40em] min-w-[30em] bg-light rounded-[5px] px-6 py-7 flex flex-col gap-5"
    onSubmit={onSubmit}
  >
    <h2 className="text-xl font-bold text-center mb-4">
      Create an Organisation
    </h2>

    <InputField
      id="name"
      label="Organisation Name*"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      placeholder="Enter organisation name"
    />

    <label htmlFor="description" className="text-gray-700 mb-[-1em]">
      Description*
    </label>
    <Textarea
      id="description"
      value={desc}
      onChange={(e) => setDesc(e.target.value)}
      placeholder="Enter description"
    />

    <Button type="submit" className="w-full h-12 text-xl">
      Submit
    </Button>

    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
  </form>
);

export default OrganisationPage;
