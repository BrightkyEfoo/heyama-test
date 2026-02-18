"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchObjects } from "@/lib/api";
import { socket } from "@/lib/socket";
import { ObjectCard } from "./object-card";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function ObjectsList() {
  const [page, setPage] = useState(1);
  const queryClent = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["objects", page],
    queryFn: () => fetchObjects(page),
  });

  useEffect(() => {
    const onCreated = (data: unknown) => {
      console.log("object:created", data);
      queryClent.invalidateQueries({ queryKey: ["objects"] });
    };
    const onDeleted = (data: unknown) => {
      console.log("object:deleted", data);
      queryClent.invalidateQueries({ queryKey: ["objects"] });
    };
    socket.on("object:created", onCreated);
    socket.on("object:deleted", onDeleted);
    return () => {
      socket.off("object:created", onCreated);
      socket.off("object:deleted", onDeleted);
    };
  }, [queryClent]);

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.data?.map((item: any) => (
          <ObjectCard key={item._id} item={item} />
        ))}
      </div>
      {data?.data?.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">Aucun objet pour le moment</p>
      )}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Precedent
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
