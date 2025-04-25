"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchProgrammeById,
  fetchProgrammeYears,
  deleteProgramme,
} from "@/app/api/programmes";
import { ProgrammeDto, ProgrammeYearResponseDto } from "@/app/types/programmes";
import { Button } from "@/components/ui/button";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import { formatText } from "@/app/utils/text";

const ITEMS = 5;

export default function ProgrammeDetails() {
  const { id } = useParams<{ id: string }>();
  const programmeId = id ? Number(id) : undefined;
  const router = useRouter();

  const [programme, setProgramme] = useState<ProgrammeDto>();
  const [years, setYears] = useState<ProgrammeYearResponseDto[]>([]);
  const [pg, setPg] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!programmeId) {
      toast.error("Invalid programme id");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [p, ys] = await Promise.all([
          fetchProgrammeById(programmeId),
          fetchProgrammeYears(programmeId),
        ]);
        setProgramme(p);
        setYears(ys);
      } catch {
        toast.error("Unable to load programme");
      } finally {
        setLoading(false);
      }
    })();
  }, [programmeId]);

  const del = async () => {
    if (!programmeId) return;
    try {
      await deleteProgramme(programmeId);
      toast.success("Programme removed");
      router.push("/coordinator/programmes");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PulseLoader color="#ba5648" />
      </div>
    );

  if (!programme) return null;

  const totalPages = Math.ceil(years.length / ITEMS);
  const visible = years.slice((pg - 1) * ITEMS, pg * ITEMS);

  return (
    <section className="relative max-w-[90vw] lg:max-w-[60vw] mx-auto bg-light dark:bg-dark dark:border dark:border-white/20 rounded p-6 mb-16">
      <header className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{programme.name}</h1>
          <p className="mt-1 text-muted-foreground">{programme.description}</p>
          <p className="mt-2 text-sm">
            Participants: <strong>{programme.participants}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="blueOutline" onClick={() => router.push(`${id}/edit`)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </header>

      <div className="mb-10">
        <h2 className="font-semibold mb-3">Eligible course-groups</h2>
        {Object.keys(programme.courseGroups || {}).length ? (
          <div className="flex flex-wrap gap-2">
            {Object.values(programme.courseGroups).map((name) => (
              <span
                key={name}
                className="rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-medium"
              >
                {formatText(name)}
              </span>
            ))}
          </div>
        ) : (
          <p className="italic text-sm text-muted-foreground">None specified</p>
        )}
      </div>

      <div>
        <header className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Programme cycles</h2>
          <Button variant="outline" onClick={() => router.push(`${id}/add-year`)}>
            Add cycle
          </Button>
        </header>

        {years.length ? (
          <>
            <table className="w-full text-sm border border-divider">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left">Academic year</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 hidden lg:table-cell">
                    Preferred algorithm
                  </th>
                  <th className="px-3 py-2 hidden lg:table-cell">
                    Participants
                  </th>
                  <th className="px-3 py-2 hidden lg:table-cell">Join code</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((y) => (
                  <tr key={y.id} className="border-t border-divider">
                    <td className="px-3 py-2">{y.academicYear}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          y.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600 dark:bg-zinc-700"
                        }`}
                      >
                        {y.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {y.preferredAlgorithm}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {y.participantCount}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {y.joinCode || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`${id}/years/${y.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <nav className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPg(i + 1)}
                    className={`w-8 h-8 rounded-full text-xs ${
                      pg === i + 1
                        ? "bg-secondary text-white"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}
          </>
        ) : (
          <p className="italic text-muted-foreground">No cycles yet.</p>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-light dark:bg-dark p-6 rounded w-[90vw] max-w-sm">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Delete programme?
            </h3>
            <p className="text-sm mb-6 text-center text-muted-foreground">
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={del}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
