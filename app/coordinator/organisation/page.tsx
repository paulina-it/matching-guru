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
import { toast, Toaster } from "react-hot-toast"; // Import toast

type OrganisationData = {
  id: number;
  name: string;
  description: string;
  joinCode: string;
};

const OrganisationPage = () => {
  const [organisation, setOrganisation] = useState<OrganisationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdminOrganisation();
        setOrganisation(data);
      } catch (err) {
        toast.error("Failed to fetch organisation data.");
        console.error("Error fetching organisation data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    if (organisation?.joinCode) {
      navigator.clipboard.writeText(organisation.joinCode)
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

  if (loading) {
    return <PulseLoader color="#ba5648" size={15} />;
  }

  return (
    <div className="w-full h-full bg-primary flex items-center justify-center">
      <Toaster position="top-right" /> {/* Toast container */}
      {organisation ? (
        <div className="bg-light p-12 rounded-[10px]">
          <h1 className="h1 mb-4">{organisation.name}</h1>
          <p className="mb-5">{organisation.description}</p>
          <h2 className="h3 bg-secondary text-white p-4 rounded flex items-center justify-between">
            Join Code: <span className="font-bold">{organisation.joinCode}</span>
            <Button onClick={handleCopy} className="ml-4 text-sm">
              Copy
            </Button>
          </h2>
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
