"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { fetchProgrammesByOrganisationId } from "@/app/api/programmes";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import Link from "next/link";

const Programmes = () => {
  const [error, setError] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleRedirect = () => {
    redirect("programmes/create");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.organisationId) {
          const data = await fetchProgrammesByOrganisationId(
            user.organisationId
          );
          setProgrammes(data);
          if (programmes.length > 0) {
            setActive(true);
          }
        } else {
          toast.error("Organisation ID is undefined.");
        }
      } catch (err) {
        toast.error("Failed to fetch programmes.");
        console.error("Error fetching programmes:", err);
        setError("Failed to fetch programmes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.organisationId]);

  const indexOfLastProgramme = currentPage * itemsPerPage;
  const indexOfFirstProgramme = indexOfLastProgramme - itemsPerPage;
  const currentProgrammes = programmes.slice(
    indexOfFirstProgramme,
    indexOfLastProgramme
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="bg-light dark:bg-dark dark:border dark:border-white/30 p-4 rounded lg:w-[50vw] relative m-5">
      <h2 className="h2 mb-4">Programmes</h2>
      <Button
        onClick={handleRedirect}
        variant="outline"
        disabled={active}
        className="text-accent hover:text-white top-5 right-5 absolute"
      >
        Create a Programme
      </Button>
      <Button
        onClick={handleRedirect}
        variant="outline"
        disabled={active}
        className="text-accent text-2xl hover:text-white absolute top-5 right-5 lg:hidden"
      >
        +
      </Button>

      <div>
        {currentProgrammes.length > 0 ? (
          currentProgrammes.map((programme, index) => (
            <Link href={`programmes/${programme.id}`} key={programme.id}>
              <div className="mb-4 p-4 bg-white dark:bg-dark dark:border dark:border-white/30 rounded shadow">
                <h3 className="text-lg font-semibold">{programme.name}</h3>
                <p className="text-gray-700 dark:text-light/80">
                  {programme.description}
                </p>
                <p className="mt-5">Participants: {programme.participants}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 italic">No programmes available.</p>
        )}
      </div>

      {/* Pagination controls */}
      {programmes.length > itemsPerPage && (
        <div className="mt-4 flex justify-center gap-4">
          {Array.from(
            { length: Math.ceil(programmes.length / itemsPerPage) },
            (_, index) => (
              <Button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                variant="outline"
                className={`px-4 py-2 ${
                  currentPage === index + 1
                    ? "bg-primary text-white"
                    : "bg-white text-black"
                }`}
              >
                {index + 1}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Programmes;
