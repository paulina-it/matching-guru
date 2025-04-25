"use client";

import React, { useEffect, useState } from "react";
import Link                       from "next/link";
import { useRouter }              from "next/navigation";
import toast                      from "react-hot-toast";
import { PulseLoader }            from "react-spinners";

import { Button }                 from "@/components/ui/button";
import { useAuth }                from "@/app/context/AuthContext";
import { ProgrammeDto }           from "@/app/types/programmes";
import { fetchMyAndAvailableProgrammes } from "@/app/api/programmes";

const Programmes = () => {
  const { user }              = useAuth();
  const router                = useRouter();
  const [myProgs, setMyProgs] = useState<ProgrammeDto[]>([]);
  const [avail,   setAvail]   = useState<ProgrammeDto[]>([]);
  const [loading, setLoad]    = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    setLoad(true);
    fetchMyAndAvailableProgrammes(user.id)
      .then(({ myProgrammes, availableProgrammes }) => {
        setMyProgs(myProgrammes);
        setAvail(availableProgrammes);
      })
      .catch(e => toast.error(e.message || "Failed to load programmes"))
      .finally(() => setLoad(false));
  }, [user?.id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <PulseLoader color="#ba5648" />
      </div>
    );

  return (
    <main className="bg-light dark:bg-zinc-900 p-6 rounded max-w-screen-md mx-auto dark:border dark:border-white/30">

      <section className="mb-10">
        <h2 className="h2 mb-4">My Programmes</h2>

        {myProgs.length ? (
          myProgs.map(p => (
            <article key={p.id} className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded shadow flex flex-col gap-4">
              <Link href={`/participant/programmes/${p.id}`}>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-muted-foreground">{p.description}</p>
              </Link>

              <div className="flex justify-end">
                <Button onClick={() => router.push(`/participant/programmes/${p.id}`)}>
                  View details
                </Button>
              </div>
            </article>
          ))
        ) : (
          <p className="italic text-muted-foreground">
            You are not enrolled in any programmes yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="h2 mb-4">Available Programmes</h2>

        {avail.length ? (
          avail.map(p => (
            <article key={p.id} className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded shadow flex flex-col gap-4">
              <Link href={`/participant/programmes/${p.id}`}>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-muted-foreground">{p.description}</p>
              </Link>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.push(`/participant/programmes/${p.id}`)}>
                  View details
                </Button>
              </div>
            </article>
          ))
        ) : (
          <p className="italic text-muted-foreground">No programmes available.</p>
        )}
      </section>
    </main>
  );
};

export default Programmes;
