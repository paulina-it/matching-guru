"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchActiveProgrammesByOrganisationId,
  fetchProgrammesByUserId,
} from "@/app/api/programmes";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import Link from "next/link";

const Programmes = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [userProgrammes, setUserProgrammes] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.organisationId) {
          const data = await fetchActiveProgrammesByOrganisationId(
            user.organisationId
          );
          setProgrammes(data);
        } else {
          toast.error("Organisation ID is undefined.");
        }
        if (user?.id) {
          const data = await fetchProgrammesByUserId(user.id);
          setUserProgrammes(data);
        } else {
          toast.error("User ID is undefined.");
        }
      } catch (err) {
        toast.error("Failed to fetch programmes.");
        console.error("Error fetching programmes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.organisationId]);

  const availableProgrammes = programmes.filter(
    (programme) =>
      !userProgrammes.some((userProgramme) => userProgramme.id === programme.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="bg-light dark:bg-zinc-900 text-black dark:text-white p-4 rounded w-[50vw] transition-colors duration-300 dark:border dark:border-white/30">
      <div>
        <h2 className="h2 mb-4">My Programmes</h2>
        <div>
          {userProgrammes.length > 0 ? (
            userProgrammes.map((programme, index) => (
              <Link href={`programmes/${programme.id}`} key={index}>
                <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded shadow transition-colors">
                  <h3 className="text-lg font-semibold">{programme.name}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {programme.description}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic mb-6">
              You are not participating in any programmes. Take a look at the
              available options below.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="h2 text-3xl mb-4">Available Programmes</h2>
        <div>
          {availableProgrammes.length > 0 ? (
            availableProgrammes.map((programme, index) => (
              <Link href={`programmes/${programme.id}`} key={index}>
                <div className="mb-4 p-4 bg-white dark:bg-zinc-800 rounded shadow transition-colors">
                  <h3 className="text-lg font-semibold">{programme.name}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {programme.description}
                  </p>
                  <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">
                    Participants: {programme.participants}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No programmes available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programmes;
