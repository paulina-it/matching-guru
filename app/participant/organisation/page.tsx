"use client";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { fetchOrganisation, joinOrganisation } from "@/app/api/organisation";
import { useAuth } from "@/app/context/AuthContext";
import { PulseLoader } from "react-spinners";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { OrganisationResponseDto } from "@/app/types/organisation";
import { Input } from "@/components/ui/input";

const OrganisationPage = () => {
  const [organisation, setOrganisation] =
    useState<OrganisationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organisationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchOrganisation(user.organisationId);
        setOrganisation(data);
      } catch (err) {
        toast.error("Failed to fetch organisation.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleJoinOrganisation = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a join code.");
      return;
    }

    try {
      setIsJoining(true);
      await joinOrganisation(joinCode.trim());
      toast.success("Successfully joined the organisation!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Invalid join code.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        role="status"
        aria-label="Loading organisation details"
      >
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <main
      className="w-full max-w-screen-lg mx-auto px-4 py-10 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen"
      role="main"
    >
      <Toaster position="top-right" />
      {organisation ? (
        <section
          aria-labelledby="org-heading"
          className="bg-light dark:bg-dark dark:border dark:border-white/30 my-[10vh] p-5 lg:p-12 rounded-[10px]"
        >
          <div className="flex lg:flex-row flex-col-reverse justify-between gap-[3em]">
            <div>
              <h1 id="org-heading" className="h1 mb-4">
                {organisation.name}
              </h1>
              <p>{organisation.description}</p>
            </div>
            <Image
              src={organisation.logoUrl}
              width={200}
              height={200}
              alt={`${organisation.name} Logo`}
              className="m-auto"
              role="img"
            />
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="join-heading"
          className="bg-light dark:bg-dark dark:border dark:border-white/30 p-6 sm:p-8 lg:p-10 rounded-xl w-full max-w-xl text-dark dark:text-light shadow-md"
        >
          <h2 id="join-heading" className="text-xl font-semibold mb-4">
            Join an Organisation
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinOrganisation();
            }}
            aria-describedby="join-desc"
          >
            <label
              htmlFor="joinCode"
              className="block mb-2 text-sm font-medium"
            >
              Enter Organisation Join Code
            </label>
            <Input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter code..."
              className="mb-4"
              aria-required="true"
            />
            <p id="join-desc" className="sr-only">
              Type the code provided by your university or organisation to join
            </p>
            <Button
              type="submit"
              disabled={isJoining}
              className="w-full"
              aria-disabled={isJoining}
              aria-busy={isJoining}
            >
              {isJoining ? "Joining..." : "Join Organisation"}
            </Button>
          </form>
        </section>
      )}
    </main>
  );
};

export default OrganisationPage;
