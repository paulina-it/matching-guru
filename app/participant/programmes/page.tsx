"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchActiveProgrammesByOrganisationId,
  fetchProgrammesByUserId,
} from "@/app/api/programmes";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Programmes = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [userProgrammes, setUserProgrammes] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.organisationId) {
          const data = await fetchActiveProgrammesByOrganisationId(user.organisationId);
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
    (programme) => !userProgrammes.some((u) => u.id === programme.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" role="status" aria-live="polite">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <main
      className="bg-light dark:bg-zinc-900 text-black dark:text-white p-4 sm:p-6 lg:p-8 rounded w-full max-w-screen-md mx-auto transition-colors duration-300 dark:border dark:border-white/30"
      role="main"
      aria-labelledby="programmes-main-heading"
    >
      <h1 id="programmes-main-heading" className="sr-only">
        Programmes Dashboard
      </h1>

      {/* My Programmes */}
      <section aria-labelledby="my-programmes-heading" className="mb-10">
        <h2 id="my-programmes-heading" className="h2 mb-4">
          My Programmes
        </h2>
        <div>
          {userProgrammes.length > 0 ? (
            userProgrammes.map((programme, index) => (
              <article
                key={programme.id}
                aria-labelledby={`my-programme-${programme.id}-title`}
                className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded shadow transition-colors flex flex-col gap-4"
              >
                <Link href={`programmes/${programme.id}`}>
                  <div>
                    <h3
                      id={`my-programme-${programme.id}-title`}
                      className="text-lg font-semibold"
                    >
                      {programme.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {programme.description}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-fit"
                    aria-label={`View details of ${programme.name}`}
                    onClick={() => router.push(`/participant/programmes/${programme.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <p
              className="text-gray-500 dark:text-gray-400 italic mb-6"
              role="note"
            >
              You are not participating in any programmes. Take a look at the
              available options below.
            </p>
          )}
        </div>
      </section>

      {/* Available Programmes */}
      <section aria-labelledby="available-programmes-heading">
        <h2 id="available-programmes-heading" className="h2 text-3xl mb-4">
          Available Programmes
        </h2>
        <div>
          {availableProgrammes.length > 0 ? (
            availableProgrammes.map((programme) => (
              <article
                key={programme.id}
                aria-labelledby={`available-programme-${programme.id}-title`}
                className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded shadow transition-colors flex flex-col gap-4"
              >
                <Link href={`/participant/programmes/${programme.id}`}>
                  <div>
                    <h3
                      id={`available-programme-${programme.id}-title`}
                      className="text-lg font-semibold"
                    >
                      {programme.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {programme.description}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-fit"
                    aria-label={`View details of ${programme.name}`}
                    onClick={() => router.push(`/programmes/${programme.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic" role="note">
              No programmes available.
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Programmes;
