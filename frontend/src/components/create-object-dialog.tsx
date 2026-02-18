"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createObjet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormValues {
  title: string;
  descripton: string;
}

export function CreateObjectDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const droped = e.dataTransfer.files[0];
      if (droped?.type.startsWith("image/")) handleFile(droped);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const mutation = useMutation({
    mutationFn: (data: FormData) => createObjet(data),
    onSuccess: () => {
      reset();
      setFile(null);
      setPreview(null);
      setOpen(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("title", values.title);
    if (values.descripton) fd.append("descripton", values.descripton);
    fd.append("image", file);
    mutation.mutate(fd);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Creer un objet</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Nouvel objet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Titre de l'objet"
            />
          </div>
          <div>
            <Label htmlFor="descripton">Description</Label>
            <Textarea
              id="descripton"
              {...register("descripton")}
              placeholder="Description (optionel)"
            />
          </div>
          <div>
            <Label>Image</Label>
            {preview ? (
              <div className="relative mt-1">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-40 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  x
                </button>
              </div>
            ) : (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`mt-1 border-2 border-dashed rounded-md p-6 text-center cursor-pointer text-sm text-muted-foreground ${
                  dragging ? "border-primary bg-muted" : "border-border"
                }`}
              >
                Glissez une image ici ou cliquez pour selectionner
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending || !formState.isValid || !file}>
            {mutation.isPending ? "Creation..." : "Creer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
