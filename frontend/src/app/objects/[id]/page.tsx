"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchObjet, deleteObjet, getImageUrl } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClent = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: obj, isLoading } = useQuery({
    queryKey: ["object", id],
    queryFn: () => fetchObjet(id),
  });

  const deleteMutaion = useMutation({
    mutationFn: () => deleteObjet(id),
    onSuccess: () => {
      queryClent.invalidateQueries({ queryKey: ["objects"] });
      router.push("/");
    },
  });

  useEffect(() => {
    const onDeleted = (payload: { id: string }) => {
      console.log("object:deleted", payload);
      if (payload.id === id) {
        queryClent.invalidateQueries({ queryKey: ["objects"] });
        router.push("/");
      }
    };
    socket.on("object:deleted", onDeleted);
    return () => {
      socket.off("object:deleted", onDeleted);
    };
  }, [id, queryClent, router]);

  if (isLoading) return <p className="p-6">Chargement...</p>;
  if (!obj) return <p className="p-6">Objet introuvable</p>;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative w-full h-80">
        <img
          src={getImageUrl(obj.imageUrl)}
          alt={obj.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative -mt-6 bg-white rounded-t-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">{obj.title}</h1>
        {obj.descripton && (
          <p className="text-muted-foreground mb-4">{obj.descripton}</p>
        )}
        <p className="text-sm text-muted-foreground mb-6">
          {new Date(obj.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          Supprimer
        </Button>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Etes-vous sur de vouloir supprimer cet objet ?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutaion.mutate()}
                disabled={deleteMutaion.isPending}
              >
                {deleteMutaion.isPending ? "Suppression..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
