"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchProgrammeById,
  fetchProgrammeYears,
  deleteProgramme,
} from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearResponseDto } from "@/app/types/programmes";
import { PulseLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ProgrammeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const programmeId = id ? parseInt(id, 10) : null;
  const router = useRouter(); 

  const [programme, setProgramme] = useState<ProgrammeDto | null>(null);
  const [programmeYears, setProgrammeYears] = useState<
    ProgrammeYearResponseDto[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!programmeId) {
      toast.error("Invalid Programme ID.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [programmeData, yearsData] = await Promise.all([
          fetchProgrammeById(programmeId),
          fetchProgrammeYears(programmeId),
        ]);
        setProgramme(programmeData);
        setProgrammeYears(yearsData);
      } catch (err) {
        toast.error("Error fetching programme details: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programmeId]);

  const handleRedirect = () => {
    router.push(`${id}/add-year`);
  };

  const handleRedirectDetails = (yearId: number) => {
    router.push(`${id}/years/${yearId}`);
  };

  const handleEditProgramme = () => {
    router.push(`${programmeId}/edit`);
  };

  const handleDeleteProgramme = async () => {
    if (!programmeId) return;

    try {
      await deleteProgramme(programmeId);
      toast.success("Programme deleted successfully");
      router.push("/coordinator/programmes");
    } catch (error) {
      toast.error("Error deleting programme: " + error);
    }
  };

  const indexOfLastYear = currentPage * itemsPerPage;
  const indexOfFirstYear = indexOfLastYear - itemsPerPage;
  const currentYears = programmeYears?.slice(indexOfFirstYear, indexOfLastYear);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCloseModal = () => setShowDeleteModal(false);
  const handleOpenModal = () => setShowDeleteModal(true);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#ba5648" size={15} />
      </div>
    );
  }

  return (
    <div className="max-w-[90vw] lg:max-w-[55vw] bg-light dark:bg-dark dark:border dark:border-white/30  p-6 rounded shadow relative">
      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-dark p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">
              ⚠️ Confirm Deletion
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Are you sure you want to delete this programme? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProgramme}>
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Year Button */}
      <div className="absolute right-5 flex gap-2">
        <Button onClick={handleEditProgramme} variant="secondary">
          Edit
        </Button>
        <Button onClick={handleOpenModal} variant="destructive">
          Delete
        </Button>
      </div>

      {/* Programme Details */}
      <h2 className="h2 font-bold mb-4">{programme?.name}</h2>
      <p className="text-gray-700 dark:text-light/70">
        {programme?.description}
      </p>
      <p className="mt-4">Total Participants: {programme?.participants}</p>

      <div className="mt-6">
        <div className="flex justify-between">
          <h3 className="h3">Academic Years</h3>

          <Button
            onClick={handleRedirect}
            variant="outline"
            className="hidden lg:block"
          >
            Add Programme Cycle
          </Button>
          <Button
            onClick={handleRedirect}
            variant="outline"
            className="absolute right-5 lg:hidden"
          >
            +
          </Button>
        </div>
        {programmeYears && programmeYears.length > 0 ? (
          <table className="w-full mt-4 border-collapse border border-gray-300 text-sm text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-black/50">
                <th className="border border-gray-300 px-4 py-2">
                  Academic Year
                </th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Preferred Algorithm
                </th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Participants
                </th>
                <th className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                  Join Code
                </th>
                <th className="border border-gray-300 px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {currentYears?.map((year) => (
                <tr key={year.id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {year.academicYear}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {year.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.preferredAlgorithm}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.participantCount}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 lg:table-cell hidden">
                    {year.joinCode || "N/A"}
                  </td>
                  <td>
                    <Button
                      onClick={() => handleRedirectDetails(year.id)}
                      variant="outline"
                      className="w-full"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>This programme has not taken place yet.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {programmeYears && programmeYears.length > itemsPerPage && (
        <div className="mt-4 flex justify-center gap-4">
          {Array.from(
            { length: Math.ceil((programmeYears.length || 0) / itemsPerPage) },
            (_, index) => (
              <Button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                variant="outline"
                className={`px-4 py-2 ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
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

export default ProgrammeDetails;
